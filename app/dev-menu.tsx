import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getUserId } from '@/utils/storage';

export default function DevMenu() {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

    // Get current user ID
    useEffect(() => {
        const loadCurrentUserId = async () => {
            const userId = await getUserId();
            setCurrentUserId(userId);
        };
        loadCurrentUserId();
    }, []);

    const screens = [
        // Auth screens
        { name: 'Landing Page', route: '/landing-page', icon: 'home' },
        { name: 'Create Account', route: '/register', icon: 'user-plus' },
        { name: 'Login', route: '/signin', icon: 'log-in' },

        // Main screens
        { name: 'Home Page', route: '/home-page', icon: 'home' },

        // Donor screens
        { name: 'Become Donor', route: '/become-donor', icon: 'heart' },
        { name: 'Search Donors', route: '/search-donors', icon: 'search' },

        // User screens
        { name: 'User Profile', route: `/profile/${currentUserId}`, icon: 'user' },
        { name: 'Appointments', route: '/appointments', icon: 'calendar' },
        { name: "Notifications", route: "/notifications", icon: "bell" },


        // Post screens
        { name: 'Create Post', route: '/create-post', icon: 'plus-square' },
        { name: 'Edit Post', route: '/edit-post', icon: 'edit' },
        { name: "Location Picker", route: "/location-example", icon: "map-pin" },

        // Other
        { name: 'Loading', route: '/loading', icon: 'loader' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🛠️ Dev Menu</Text>
                <Text style={styles.subtitle}>Tap to view any screen</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {screens.map((screen, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => {
                            try {
                                router.push(screen.route as any);
                            } catch (error) {
                                console.error(`Failed to navigate to ${screen.route}:`, error);
                            }
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <Feather name={screen.icon as any} size={24} color="#D32F2F" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.screenName}>{screen.name}</Text>
                            <Text style={styles.screenRoute}>{screen.route}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFE0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    screenName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    screenRoute: {
        fontSize: 12,
        color: '#999',
    },
});
