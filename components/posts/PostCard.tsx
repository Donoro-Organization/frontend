import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, IconButton, Menu, Avatar } from 'react-native-paper';
import { Post, PendingPost } from '@/types/post';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';

interface PostCardProps {
    post: Post | PendingPost;
    userName: string;
    userImage?: string;
    isOwnPost: boolean;
    onEdit?: (post: Post) => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({
    post,
    userName,
    userImage,
    isOwnPost,
    onEdit,
    onDelete
}: PostCardProps) {
    const [menuVisible, setMenuVisible] = useState(false);

    const isPending = 'isPending' in post && post.isPending;

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const handleEdit = () => {
        setMenuVisible(false);
        if (onEdit && !isPending) {
            onEdit(post as Post);
        }
    };

    const handleDelete = () => {
        setMenuVisible(false);
        if (onDelete) {
            onDelete(post.id);
        }
    };

    return (
        <View style={[styles.container, isPending && styles.pendingContainer]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {isPending ? (
                        <>
                            <View style={styles.uploadingIconContainer}>
                                <Feather name="upload-cloud" size={40} color="#D32F2F" />
                            </View>
                            <Text style={styles.uploadingText}>
                                {(post as PendingPost).uploadProgress?.isEdit ? 'Editing post...' : 'Uploading post...'}
                            </Text>
                        </>
                    ) : (
                        <>
                            {userImage ? (
                                <Image source={{ uri: userImage }} style={styles.avatar} />
                            ) : (
                                <Avatar.Text
                                    size={40}
                                    label={userName.substring(0, 2).toUpperCase()}
                                    style={styles.avatarFallback}
                                />
                            )}
                            <View style={styles.userDetails}>
                                <View style={styles.nameLocationRow}>
                                    <Text style={styles.userName}>{userName}</Text>
                                    {post.location && (
                                        <>
                                            <Feather name="map-pin" size={14} color="#666" style={styles.locationIcon} />
                                            <Text style={styles.location}>is in </Text>
                                            <Text style={styles.locationName}>{post.location}</Text>
                                        </>
                                    )}
                                </View>
                                <Text style={styles.date}>{formatDate(post.created_at)}</Text>
                            </View>
                        </>
                    )}
                </View>

                {isOwnPost && !isPending && (
                    <Menu
                        contentStyle={styles.menu}
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <IconButton
                                icon="dots-horizontal"
                                size={20}
                                onPress={() => setMenuVisible(true)}
                            />
                        }
                    >
                        <Menu.Item
                            onPress={handleEdit}
                            title="Edit"
                            leadingIcon="pencil"
                        />
                        <Menu.Item
                            onPress={handleDelete}
                            title="Delete"
                            leadingIcon="delete"
                            titleStyle={{ color: '#D32F2F' }}
                        />
                    </Menu>
                )}

                {isPending && post.uploadProgress && (
                    <Text style={styles.percentageText}>
                        {Math.round((post.uploadProgress.uploadedImages / post.uploadProgress.totalImages) * 100)}%
                    </Text>
                )}
            </View>

            {/* Content */}
            <Text style={styles.content}>{post.content}</Text>

            {/* Upload Progress Bar */}
            {isPending && post.uploadProgress && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${(post.uploadProgress.uploadedImages / post.uploadProgress.totalImages) * 100}%`
                                }
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Images */}
            {!isPending && 'images' in post && post.images && post.images.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesContainer}
                >
                    {post.images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image.url }}
                            style={styles.postImage}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    pendingContainer: {
        opacity: 0.6,
    },
    menu: {
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarFallback: {
        backgroundColor: '#FF5252',
    },
    uploadingIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    nameLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginRight: 4,
    },
    uploadingText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        marginLeft: 12,
        alignSelf: 'center',
    },
    locationIcon: {
        marginLeft: 4,
        marginRight: 2,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    date: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    separator: {
        fontSize: 13,
        color: '#666',
    },
    location: {
        fontSize: 13,
        color: '#666',
    },
    locationName: {
        fontSize: 13,
        color: '#000',
        fontWeight: '500',
    },
    percentageText: {
        fontSize: 14,
        color: '#D32F2F',
        fontWeight: '600',
    },
    pendingBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingText: {
        fontSize: 11,
        color: '#F57C00',
        fontWeight: '500',
    },
    content: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#D32F2F',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'right',
    },
    imagesContainer: {
        marginTop: 8,
    },
    postImage: {
        width: 260,
        height: 200,
        borderRadius: 8,
        marginRight: 8,
    },
});
