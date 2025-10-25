import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, IconButton } from 'react-native-paper';
import DonorProfile from '@/components/profile/DonorProfile';
import UserProfile from '@/components/profile/UserProfile';
import { User, UserRole } from '@/types/user';
import { useAPI } from '@/hooks/useAPI';
import { getUserId } from '@/utils/storage';
import ErrorDialog from '@/components/ErrorDialog';

export default function ProfilePage() {
    const { userID } = useLocalSearchParams<{ userID: string }>();
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch user data
    const { data: userData, loading, error } = useAPI<User>(
        `/users/${userID}`,
        {
            enabled: !!userID,
        }
    );

    // Get current user ID
    useEffect(() => {
        const loadCurrentUserId = async () => {
            const userId = await getUserId();
            setCurrentUserId(userId);
        };
        loadCurrentUserId();
    }, []);

    // Handle errors
    useEffect(() => {
        if (error) {
            setErrorMessage('Failed to load user profile. Please try again.');
            setIsErrorVisible(true);
        }
    }, [error]);

    const isOwnProfile = currentUserId === userID;

    if (loading || !currentUserId) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: 'Profile',
                        headerStyle: { backgroundColor: '#FFF' },
                        headerTintColor: '#000',
                        headerLeft: () => (
                            <IconButton
                                icon="arrow-left"
                                size={24}
                                onPress={() => router.back()}
                            />
                        ),
                        headerRight: () => (
                            <IconButton
                                icon="magnify"
                                size={24}
                                onPress={() => {
                                    // TODO: Implement search
                                    console.log('Search');
                                }}
                            />
                        ),
                    }}
                />
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.errorContainer}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: 'Profile',
                        headerStyle: { backgroundColor: '#FFF' },
                        headerTintColor: '#000',
                        headerLeft: () => (
                            <IconButton
                                icon="arrow-left"
                                size={24}
                                onPress={() => router.back()}
                            />
                        ),
                    }}
                />
                <Text style={styles.errorText}>User not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Donoro',
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: '#FFF' },
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            onPress={() => router.back()}
                        />
                    ),
                    headerRight: () => (
                        <IconButton
                            icon="magnify"
                            size={24}
                            onPress={() => {
                                // TODO: Implement search
                                console.log('Search');
                            }}
                        />
                    ),
                }}
            />

            {/* Render appropriate profile component based on user role */}
            {userData.role === UserRole.DONOR ? (
                <DonorProfile user={userData} isOwnProfile={isOwnProfile} />
            ) : (
                <UserProfile user={userData} isOwnProfile={isOwnProfile} />
            )}

            <ErrorDialog
                visible={isErrorVisible}
                message={errorMessage}
                onClose={() => setIsErrorVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
});
