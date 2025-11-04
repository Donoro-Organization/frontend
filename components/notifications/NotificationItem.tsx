import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Notification, NOTIFICATION_CATEGORY_ICONS, NOTIFICATION_CATEGORY_COLORS } from '@/types/notification';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const router = useRouter();

    const handlePress = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link as any);
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

    // Get icon and color for category
    const iconName = NOTIFICATION_CATEGORY_ICONS[notification.category] || NOTIFICATION_CATEGORY_ICONS.general;
    const iconColor = NOTIFICATION_CATEGORY_COLORS[notification.category] || NOTIFICATION_CATEGORY_COLORS.general;

    // Dynamic styles based on category color
    const dynamicUnreadStyle = !notification.is_read ? {
        backgroundColor: `${iconColor}08`, // Very light background (5% opacity)
        borderLeftColor: iconColor,
    } : {};

    return (
        <TouchableOpacity
            style={[styles.container, !notification.is_read && styles.unread, dynamicUnreadStyle]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Category Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={iconName as any} size={24} color={iconColor} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {notification.title}
                    </Text>
                    <View style={styles.rightHeader}>
                        <Text style={styles.time}>{timeAgo}</Text>
                        {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: iconColor }]} />}
                    </View>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                    {notification.message}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'flex-start',
    },
    unread: {
        borderLeftWidth: 4,
        // Background color and border color are set dynamically inline
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
        marginRight: 8,
    },
    rightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        // Background color is set dynamically inline
    },
    message: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    time: {
        fontSize: 11,
        color: '#888',
    },
});
