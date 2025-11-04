import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refetchNotifications,
    } = useNotifications();

    // Refetch notifications when screen mounts
    useEffect(() => {
        refetchNotifications();
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <NotificationHeader
                unreadCount={unreadCount}
                isConnected={isConnected}
                onMarkAllAsRead={markAllAsRead}
            />

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                    <Text style={styles.emptySubtext}>
                        You'll see notifications here when you receive them
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NotificationItem notification={item} onMarkAsRead={markAsRead} />
                    )}
                    contentContainerStyle={[styles.listContent, notifications.length === 0 && styles.emptyList]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    listContent: {
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f8f8f8',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
    },
    emptyList: {
        flexGrow: 1,
    },
});