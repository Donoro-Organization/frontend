import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { Post } from '@/types/post';

export default function EditPostScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ post: string }>();
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (params.post) {
            try {
                const postData = JSON.parse(params.post) as Post;
                setPost(postData);
                setContent(postData.content);
                setLocation(postData.location || '');
            } catch (error) {
                setErrorMessage('Failed to load post data');
                setIsErrorVisible(true);
            }
        }
    }, [params.post]);

    const handleSubmit = async () => {
        if (!content.trim()) {
            setErrorMessage('Please write something to post');
            setIsErrorVisible(true);
            return;
        }

        if (!post) return;

        setIsSubmitting(true);

        try {
            // Update post content and location only
            await apiCall(`/posts/${post.id}`, {
                method: 'PUT',
                body: {
                    content: content.trim(),
                    location: location.trim() || undefined,
                },
            });

            // Navigate back and trigger refetch
            router.back();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update post');
            setIsErrorVisible(true);
        } finally {
            setIsSubmitting(false);
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

                <View style={styles.infoCard}>
                    <Feather name="info" size={16} color="#666" />
                    <Text style={styles.infoText}>
                        Note: Images cannot be edited. Only content and location can be updated.
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
