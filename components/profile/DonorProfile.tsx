import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton, Avatar, Dialog, Portal } from 'react-native-paper';
import { User } from '@/types/user';
import { Post, PendingPost } from '@/types/post';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '@/components/posts/PostCard';
import { useAPI, apiCall } from '@/hooks/useAPI';
import { usePostUpload } from '@/contexts/PostUploadContext';

interface UserProfileProps {
    user: User;
    isOwnProfile: boolean;
}

export default function UserProfile({ user, isOwnProfile }: UserProfileProps) {
    const router = useRouter();
    const { uploadingPosts } = usePostUpload();
    const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch user posts
    const { data: postsResponse, loading: postsLoading, refetch: refetchPosts } = useAPI<{
        status_code: number;
        message: string;
        data: {
            total: number;
            posts: Post[];
        };
    }>(`/posts/donor/${user.id}`, {
        enabled: true,
    });

    const posts = postsResponse?.data?.posts || [];

    // Refetch posts when screen comes into focus (after create/edit)
    useFocusEffect(
        React.useCallback(() => {
            refetchPosts();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    // Track previous upload count to detect completion
    const [prevUploadCount, setPrevUploadCount] = useState(0);

    useEffect(() => {
        const currentCount = uploadingPosts.size;

        // If we had uploads before and now we don't, refresh the posts
        if (prevUploadCount > 0 && currentCount === 0) {
            console.log('Upload completed, refetching posts');
            refetchPosts();
        }

        setPrevUploadCount(currentCount);
    }, [uploadingPosts.size, prevUploadCount, refetchPosts]);

    const getFullName = () => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user.first_name || user.last_name || 'No Name';
    };

    const handleEditProfile = () => {
        // TODO: Navigate to edit profile page
        console.log('Edit profile');
    };

    const handleAddPost = () => {
        router.push('/create-post');
    };

    const handleEditPost = (post: Post) => {
        router.push({
            pathname: '/edit-post',
            params: { post: JSON.stringify(post) },
        });
    };

    const handleDeletePost = (postId: string) => {
        setPostToDelete(postId);
        setDeleteDialogVisible(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            await apiCall(`/posts/${postToDelete}`, {
                method: 'DELETE',
            });

            // Remove from pending posts if it exists there
            setPendingPosts(prev => prev.filter(p => p.id !== postToDelete));

            // Refetch posts
            refetchPosts();
        } catch (error) {
            console.error('Failed to delete post:', error);
        } finally {
            setIsDeleting(false);
            setDeleteDialogVisible(false);
            setPostToDelete(null);
        }
    };

    const handleReview = () => {
        // TODO: Navigate to review page
        console.log('Review user');
    };

    const handleMessage = () => {
        // TODO: Navigate to message page
        console.log('Message user');
    };

    const handleMoreOptions = () => {
        // TODO: Show more options
        console.log('More options');
    };

    // Convert uploading posts to display format with simplified progress
    const uploadingPostsArray = Array.from(uploadingPosts.values()).map(upload => ({
        id: upload.postId,
        content: 'Don\'t close the app while uploading...',
        location: '',
        donor_id: user.id,
        images: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isPending: true,
        uploadProgress: upload,
    }));

    console.log('Uploading posts:', uploadingPosts.size);
    console.log('Regular posts:', posts.length);

    // Filter out posts that are currently being uploaded from regular posts
    const uploadingPostIds = new Set(Array.from(uploadingPosts.keys()));
    const filteredPosts = posts.filter(post => !uploadingPostIds.has(post.id));

    // Show uploading posts, pending posts, and actual posts
    const allPosts = [...uploadingPostsArray, ...pendingPosts, ...filteredPosts];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
                <View style={styles.coverImage} />

                {/* Profile Image */}
                <View style={styles.profileImageContainer}>
                    {user.profile_image?.url ? (
                        <Image
                            source={{ uri: user.profile_image.url }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <Avatar.Text
                            size={150}
                            label={getFullName().substring(0, 2).toUpperCase()}
                            style={styles.avatarFallback}
                        />
                    )}
                </View>
            </View>

            {/* User Info */}
            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.userName}>{getFullName()}</Text>
                    {user.verified && (
                        <Feather name="check-circle" size={20} color="#2196F3" style={styles.verifiedIcon} />
                    )}
                </View>

                {user.bio && (
                    <Text style={styles.userBio}>{user.bio}</Text>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    {isOwnProfile ? (
                        <>
                            <Button
                                mode="contained"
                                onPress={handleAddPost}
                                style={styles.addPostButton}
                                labelStyle={styles.addPostButtonLabel}
                                icon={() => <Feather name="plus" size={18} color="#FFF" />}
                            >
                                Add Post
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={handleEditProfile}
                                style={styles.editButton}
                                labelStyle={styles.editButtonLabel}
                                icon={() => <Feather name="edit-2" size={16} color="#D32F2F" />}
                            >
                                Edit Profile
                            </Button>
                            <IconButton
                                icon="dots-horizontal"
                                size={24}
                                onPress={handleMoreOptions}
                                style={styles.moreButton}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                mode="outlined"
                                onPress={handleReview}
                                style={styles.reviewButton}
                                labelStyle={styles.reviewButtonLabel}
                            >
                                Review
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleMessage}
                                style={styles.messageButton}
                                labelStyle={styles.messageButtonLabel}
                                icon={() => <Feather name="message-circle" size={18} color="#FFF" />}
                            >
                                Message
                            </Button>
                            <IconButton
                                icon="dots-horizontal"
                                size={24}
                                onPress={handleMoreOptions}
                                style={styles.moreButton}
                            />
                        </>
                    )}
                </View>

                {/* Posts/Activity Section */}
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>
                        {isOwnProfile ? 'Your Activity' : 'Recent Activity'}
                    </Text>

                    {postsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#D32F2F" />
                            <Text style={styles.loadingText}>Loading posts...</Text>
                        </View>
                    ) : allPosts.length > 0 ? (
                        <View style={styles.postsContainer}>
                            {allPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    userName={getFullName()}
                                    userImage={user.profile_image?.url}
                                    isOwnPost={isOwnProfile}
                                    onEdit={handleEditPost}
                                    onDelete={handleDeletePost}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.activityPlaceholder}>
                            <Feather name="file-text" size={48} color="#CCC" />
                            <Text style={styles.placeholderText}>
                                {isOwnProfile ? 'No posts yet' : 'No recent activity'}
                            </Text>
                            {isOwnProfile && (
                                <Text style={styles.placeholderSubtext}>
                                    Share your donation experience with others
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Delete Confirmation Dialog */}
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => !isDeleting && setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Post</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            onPress={confirmDeletePost}
                            loading={isDeleting}
                            disabled={isDeleting}
                            textColor="#D32F2F"
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    coverContainer: {
        position: 'relative',
        height: 200,
    },
    coverImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#D32F2F',
    },
    profileImageContainer: {
        position: 'absolute',
        bottom: -75,
        left: '50%',
        transform: [{ translateX: -75 }],
        borderWidth: 5,
        borderColor: '#FFF',
        borderRadius: 75,
        backgroundColor: '#FFF',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    avatarFallback: {
        backgroundColor: '#FF5252',
    },
    infoContainer: {
        marginTop: 90,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    verifiedIcon: {
        marginLeft: 8,
    },
    userBio: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    addPostButton: {
        flex: 1,
        backgroundColor: '#D32F2F',
        borderRadius: 6,
    },
    addPostButtonLabel: {
        color: '#FFF',
        fontSize: 14,
    },
    editButton: {
        flex: 1,
        borderColor: '#D32F2F',
        borderWidth: 1,
        borderRadius: 6,
    },
    editButtonLabel: {
        color: '#D32F2F',
        fontSize: 14,
    },
    reviewButton: {
        flex: 1,
        borderColor: '#D32F2F',
        borderWidth: 1,
        borderRadius: 6,
    },
    reviewButtonLabel: {
        color: '#D32F2F',
        fontSize: 14,
    },
    messageButton: {
        flex: 1,
        backgroundColor: '#D32F2F',
        borderRadius: 6,
    },
    messageButtonLabel: {
        color: '#FFF',
        fontSize: 14,
    },
    moreButton: {
        margin: 0,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
    },
    detailsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    activitySection: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    uploadBanner: {
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
    },
    uploadBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    uploadBannerText: {
        marginLeft: 12,
        flex: 1,
    },
    uploadBannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    uploadBannerSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    uploadBannerProgressBar: {
        height: 4,
        backgroundColor: '#FFE0B2',
        borderRadius: 2,
        overflow: 'hidden',
    },
    uploadBannerProgressFill: {
        height: '100%',
        backgroundColor: '#D32F2F',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    postsContainer: {
        marginTop: 8,
    },
    activityPlaceholder: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    placeholderSubtext: {
        fontSize: 13,
        color: '#BBB',
        marginTop: 4,
        textAlign: 'center',
    },
});
