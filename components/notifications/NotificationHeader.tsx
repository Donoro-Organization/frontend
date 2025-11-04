import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationHeaderProps {
    unreadCount: number;
    isConnected: boolean;
    onMarkAllAsRead: () => void;
}

export function NotificationHeader({
    unreadCount,
    isConnected,
    onMarkAllAsRead,
}: NotificationHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </View>

            <View style={styles.rightSection}>
                <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />

                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllButton} onPress={onMarkAllAsRead}>
                        <Ionicons name="checkmark-done" size={18} color="#fff" />
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    badge: {
        backgroundColor: '#D32F2F',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    connected: {
        backgroundColor: '#4CAF50',
    },
    disconnected: {
        backgroundColor: '#888',
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#D32F2F',
        borderRadius: 8,
    },
    markAllText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '500',
    },
});
