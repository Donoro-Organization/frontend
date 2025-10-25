import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, IconButton, Avatar } from 'react-native-paper';
import { User } from '@/types/user';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface UserProfileProps {
    user: User;
    isOwnProfile: boolean;
}

export default function UserProfile({ user, isOwnProfile }: UserProfileProps) {
    const router = useRouter();

    const getFullName = () => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user.first_name || user.last_name || 'No Name';
    };

    const handleEditProfile = () => {
        console.log('Edit profile');
    };

    const handleReview = () => {
        console.log('Review user');
    };

    const handleMessage = () => {
        console.log('Message user');
    };

    const handleMoreOptions = () => {
        console.log('More options');
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.coverContainer}>
                <View style={styles.coverImage} />

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

                <View style={styles.actionButtonsContainer}>
                    {isOwnProfile ? (
                        <>
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

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Feather name="info" size={48} color="#D32F2F" />
                        <Text style={styles.infoTitle}>Post Feature</Text>
                        <Text style={styles.infoText}>
                            Currently, only Donors have access to the post feature. Register as a donor to share your blood donation experiences!
                        </Text>
                    </View>
                </View>
            </View>
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
    infoSection: {
        marginTop: 16,
    },
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop: 16,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
