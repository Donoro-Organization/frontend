import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { usePostUpload } from '@/contexts/PostUploadContext';
import config from '@/config/config';
import { getAuthToken } from '@/utils/storage';

export default function CreatePostScreen() {
    const router = useRouter();
    const { startUpload, updateProgress, completeUpload, failUpload } = usePostUpload();
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    const pickImages = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to your photos to add images to your post');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - selectedImages.length, // Max 5 images total
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map((asset: any) => asset.uri);
                setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); // Limit to 5 images
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            setErrorMessage('Please write something to post');
            setIsErrorVisible(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Create the post first
            const response = await apiCall<{
                status_code: number;
                message: string;
                data: { id: string };
            }>('/posts', {
                method: 'POST',
                body: {
                    content: content.trim(),
                    location: location.trim() || undefined,
                },
            });

            const postId = response.data?.id;

            console.log('Post created with ID:', postId);
            console.log('Number of images to upload:', selectedImages.length);

            // If there are images, start upload tracking and navigate back immediately
            if (selectedImages.length > 0 && postId) {
                // Start tracking upload
                console.log('Starting upload tracking for post:', postId);
                startUpload(postId, selectedImages.length);

                // Navigate back immediately
                router.back();

                // Upload images in background
                uploadImagesInBackground(postId, selectedImages);
            } else {
                // No images, just navigate back
                console.log('No images to upload, navigating back');
                router.back();
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create post');
            setIsErrorVisible(true);
            setIsSubmitting(false);
        }
    };

    const uploadImagesInBackground = async (postId: string, images: string[]) => {
        console.log('Background upload started for post:', postId, 'with', images.length, 'images');
        try {
            const token = await getAuthToken();
            console.log('Auth token retrieved:', token ? 'Yes' : 'No');

            // Upload images one by one
            for (let i = 0; i < images.length; i++) {
                try {
                    console.log(`Uploading image ${i + 1}/${images.length}`);
                    const imageUri = images[i];

                    if (Platform.OS === 'web') {
                        // Web upload using fetch with blob
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

                        console.log(`Image ${i + 1} uploaded successfully:`, result);
                    } else {
                        // Native upload using FileSystem
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

                        console.log('Upload result status:', uploadResult.status);
                        const result = JSON.parse(uploadResult.body);

                        if (uploadResult.status !== 200 && uploadResult.status !== 201) {
                            throw new Error(result.message || 'Upload failed');
                        }

                        console.log(`Image ${i + 1} uploaded successfully:`, result);
                    }

                    // Update progress
                    updateProgress(postId, i + 1);
                } catch (error) {
                    console.error(`Failed to upload image ${i + 1}:`, error);
                    // Continue with next image even if one fails
                }
            }

            console.log('All images uploaded, marking as complete');
            // Mark upload as complete
            completeUpload(postId);
        } catch (error) {
            console.error('Failed to upload images:', error);
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
                    title: 'Create Post',
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
                            style={styles.postButton}
                            labelStyle={styles.postButtonLabel}
                        >
                            Post
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

                {/* Image Selection */}
                {selectedImages.length > 0 && (
                    <View style={styles.imagesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedImages.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.selectedImage} />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                        disabled={isSubmitting}
                                    >
                                        <Feather name="x" size={16} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Add Images Button */}
                <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={pickImages}
                    disabled={isSubmitting || selectedImages.length >= 5}
                >
                    <Feather name="image" size={20} color={selectedImages.length >= 5 ? '#999' : '#D32F2F'} />
                    <Text style={[styles.addImageText, selectedImages.length >= 5 && styles.addImageTextDisabled]}>
                        {selectedImages.length >= 5 ? 'Maximum 5 images' : `Add Photos (${selectedImages.length}/5)`}
                    </Text>
                </TouchableOpacity>

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

                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips for a great post:</Text>
                    <Text style={styles.tipText}>• Share your blood donation experience</Text>
                    <Text style={styles.tipText}>• Mention the location where you donated</Text>
                    <Text style={styles.tipText}>• Inspire others to donate blood</Text>
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
    postButton: {
        marginRight: 8,
        backgroundColor: '#D32F2F',
        borderRadius: 6,
    },
    postButtonLabel: {
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
    tipsContainer: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#1565C0',
        marginBottom: 4,
        lineHeight: 18,
    },
    imagesContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        marginBottom: 12,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    selectedImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addImageButton: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        marginHorizontal: 16,
        borderRadius: 8,
    },
    addImageText: {
        fontSize: 15,
        color: '#D32F2F',
        marginLeft: 8,
        fontWeight: '500',
    },
    addImageTextDisabled: {
        color: '#999',
    },
});
