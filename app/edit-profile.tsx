import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import EditProfile from '@/components/profile/EditProfile';
import { User, UserRole } from '@/types/user';
import { apiCall } from '@/hooks/useAPI';
import { getUserId } from '@/utils/storage';

export default function EditProfilePage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [donorData, setDonorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userId = await getUserId();
            if (!userId) {
                router.back();
                return;
            }

            // Fetch user data from API
            const userData: User = await apiCall(`/users/${userId}`, {
                method: 'GET',
                requiresAuth: true,
            });

            setUser(userData);

            // If user is a donor, fetch donor-specific data
            if (userData.role === UserRole.DONOR) {
                try {
                    const donorProfile = await apiCall('/donors/my-profile', {
                        method: 'GET',
                        requiresAuth: true,
                    });
                    setDonorData(donorProfile);
                } catch (error) {
                    console.error('Error loading donor data:', error);
                    // Continue even if donor data fails
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        // Navigate back or refresh
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C62828" />
            </View>
        );
    }

    if (!user) {
        return null;
    }

    return <EditProfile user={user} donorData={donorData} onSave={handleSave} />;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
});
