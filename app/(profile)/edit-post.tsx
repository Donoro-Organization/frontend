import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { Post } from '@/types/post';
import { usePostUpload } from '@/contexts/PostUploadContext';
import config from '@/config/config';
import { getAuthToken } from '@/utils/storage';

export default function EditPostScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ post: string }>();
    const { startUpload, updateProgress, completeUpload, failUpload } = usePostUpload();
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [post, setPost] = useState<Post | null>(null);
    const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    useEffect(() => {
        if (params.post) {
            try {
                const postData = JSON.parse(params.post) as Post;
                setPost(postData);
                setContent(postData.content);
                setLocation(postData.location || '');
                setExistingImages(postData.images || []);
            } catch (error) {
                setErrorMessage('Failed to load post data');
                setIsErrorVisible(true);
            }
        }
    }, [params.post]);

    const pickImages = async () => {
        try {
            const totalImages = existingImages.length - imagesToDelete.length + newImages.length;
            if (totalImages >= 5) {
                Alert.alert('Limit reached', 'You can only have up to 5 images per post');
                return;
            }

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - totalImages,
            });

            if (!result.canceled && result.assets) {
                const images = result.assets.map((asset: any) => asset.uri);
                setNewImages(prev => [...prev, ...images].slice(0, 5 - totalImages));
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const removeExistingImage = (imageId: string) => {
        setImagesToDelete(prev => [...prev, imageId]);
    };

    const restoreExistingImage = (imageId: string) => {
        setImagesToDelete(prev => prev.filter(id => id !== imageId));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setErrorMessage('Please write something to post');
            setIsErrorVisible(true);
            return;
        }

        if (!post) return;

        setIsSubmitting(true);

        try {
            // Update post content and location
            await apiCall(`/posts/${post.id}`, {
                method: 'PUT',
                body: {
                    content: content.trim(),
                    location: location.trim() || undefined,
                },
            });

            // Reset submitting state before navigation
            setIsSubmitting(false);

            // If there are images to delete or upload, start tracking
            if (imagesToDelete.length > 0 || newImages.length > 0) {
                const totalOperations = imagesToDelete.length + newImages.length;
                // Start upload tracking
                startUpload(post.id, totalOperations, true);

                // Navigate back immediately
                router.back();

                // Process images in background
                processImagesInBackground(post.id, imagesToDelete, newImages, totalOperations);
            } else {
                // No images to process, just navigate back
                router.back();
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update post');
            setIsErrorVisible(true);
            setIsSubmitting(false);
        }
    };

    const processImagesInBackground = async (
        postId: string,
        deleteIds: string[],
        uploadUris: string[],
        totalOperations: number
    ) => {
        try {
            const token = await getAuthToken();
            let completedOperations = 0;

            // Delete old images
            for (const imageId of deleteIds) {
                try {
                    await apiCall(`/posts/${postId}/images/${imageId}`, {
                        method: 'DELETE',
                    });
                    completedOperations++;
                    updateProgress(postId, completedOperations);
                } catch (error) {
                    console.error(`Failed to delete image ${imageId}:`, error);
                }
            }

            // Upload new images
            for (let i = 0; i < uploadUris.length; i++) {
                try {
                    const imageUri = uploadUris[i];

                    if (Platform.OS === 'web') {
                        const response = await fetch(imageUri);
                        const blob = await response.blob();
                        const formData = new FormData();
                        const filename = imageUri.split('/').pop() || `image_${i}.jpg`;
                        formData.append('file', blob, filename);

                        const uploadResponse = await fetch(`${config.BACKEND_API_ENDPOINT}/posts/${postId}/images`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                            body: formData,
                        });

                        const result = await uploadResponse.json();
                        if (!uploadResponse.ok || (result.status_code && result.status_code >= 400)) {
                            throw new Error(result.message || 'Upload failed');
                        }
                    } else {
                        const uploadResult = await FileSystem.uploadAsync(
                            `${config.BACKEND_API_ENDPOINT}/posts/${postId}/images`,
                            imageUri,
                            {
                                fieldName: 'file',
                                httpMethod: 'POST',
                                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            }
                        );

                        const result = JSON.parse(uploadResult.body);
                        if (uploadResult.status >= 400 || (result.status_code && result.status_code >= 400)) {
                            throw new Error(result.message || 'Upload failed');
                        }
                    }

                    completedOperations++;
                    updateProgress(postId, completedOperations);
                } catch (error) {
                    console.error(`Failed to upload image ${i}:`, error);
                }
            }

            // Complete upload
            completeUpload(postId);
        } catch (error) {
            console.error('Background image processing failed:', error);
            failUpload(postId);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Edit Post',
                    headerStyle: { backgroundColor: '#FFF' },
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <IconButton
                            icon="close"
                            size={24}
                            onPress={() => router.back()}
                            disabled={isSubmitting}
                        />
                    ),
                    headerRight: () => (
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            loading={isSubmitting}
                            disabled={isSubmitting || !content.trim()}
                            style={styles.saveButton}
                            labelStyle={styles.saveButtonLabel}
                        >
                            Save
                        </Button>
                    ),
                }}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.contentInput}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#999"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        autoFocus
                        editable={!isSubmitting}
                    />
                </View>

                <View style={styles.locationContainer}>
                    <View style={styles.locationHeader}>
                        <Feather name="map-pin" size={20} color="#D32F2F" />
                        <Text style={styles.locationLabel}>Location (Optional)</Text>
                    </View>
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Where are you?"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={setLocation}
                        editable={!isSubmitting}
                    />
                </View>

                {/* Images Section */}
                <View style={styles.imagesContainer}>
                    <View style={styles.imagesHeader}>
                        <Text style={styles.imagesLabel}>Images (Optional)</Text>
                        <Text style={styles.imagesCount}>
                            {existingImages.length - imagesToDelete.length + newImages.length}/5
                        </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                        {/* Existing Images */}
                        {existingImages.map((image) => {
                            const isMarkedForDeletion = imagesToDelete.includes(image.id);
                            return (
                                <View key={image.id} style={styles.imageWrapper}>
                                    <Image source={{ uri: image.url }} style={[styles.image, isMarkedForDeletion && styles.imageMarkedForDeletion]} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => isMarkedForDeletion ? restoreExistingImage(image.id) : removeExistingImage(image.id)}
                                        disabled={isSubmitting}
                                    >
                                        <Feather
                                            name={isMarkedForDeletion ? "rotate-ccw" : "x"}
                                            size={16}
                                            color="#FFF"
                                        />
                                    </TouchableOpacity>
                                    {isMarkedForDeletion && (
                                        <View style={styles.deletionOverlay}>
                                            <Text style={styles.deletionText}>Will be deleted</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        {/* New Images */}
                        {newImages.map((uri, index) => (
                            <View key={`new-${index}`} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeNewImage(index)}
                                    disabled={isSubmitting}
                                >
                                    <Feather name="x" size={16} color="#FFF" />
                                </TouchableOpacity>
                                <View style={styles.newImageBadge}>
                                    <Text style={styles.newImageText}>New</Text>
                                </View>
                            </View>
                        ))}

                        {/* Add Image Button */}
                        {(existingImages.length - imagesToDelete.length + newImages.length) < 5 && (
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={pickImages}
                                disabled={isSubmitting}
                            >
                                <Feather name="plus" size={32} color="#D32F2F" />
                                <Text style={styles.addImageText}>Add Image</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.infoCard}>
                    <Feather name="info" size={16} color="#666" />
                    <Text style={styles.infoText}>
                        You can add or remove images. Changes will be processed when you save.
                    </Text>
                </View>
            </ScrollView>

            <ErrorDialog
                visible={isErrorVisible}
                message={errorMessage}
                onClose={() => setIsErrorVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
    },
    saveButton: {
        marginRight: 8,
        backgroundColor: '#D32F2F',
        borderRadius: 6,
    },
    saveButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
    },
    contentInput: {
        fontSize: 16,
        color: '#000',
        minHeight: 150,
        padding: 8,
        textAlignVertical: 'top',
    },
    locationContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    locationInput: {
        fontSize: 15,
        color: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        padding: 8,
    },
    imagesContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
    },
    imagesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagesLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    imagesCount: {
        fontSize: 13,
        color: '#666',
    },
    imagesScroll: {
        marginTop: 8,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    imageMarkedForDeletion: {
        opacity: 0.4,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deletionOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(211, 47, 47, 0.9)',
        padding: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    deletionText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    newImageBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    newImageText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '600',
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
    },
    addImageText: {
        fontSize: 12,
        color: '#D32F2F',
        marginTop: 8,
        fontWeight: '600',
    },
    infoCard: {
        backgroundColor: '#FFF9E6',
        padding: 16,
        margin: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
});
