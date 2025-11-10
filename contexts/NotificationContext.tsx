import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationContextType } from '@/types/notification';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiCall } from '@/hooks/useAPI';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = '@notifications';
const MAX_NOTIFICATIONS = 50;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from storage on mount
    useEffect(() => {
        loadNotificationsFromStorage();
    }, []);

    // Calculate unread count whenever notifications change
    useEffect(() => {
        const count = notifications.filter(n => !n.is_read).length;
        setUnreadCount(count);
    }, [notifications]);

    const loadNotificationsFromStorage = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            }
        } catch (error) {
            console.error('Error loading notifications from storage:', error);
        }
    };

    const saveNotificationsToStorage = async (notifs: Notification[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
        } catch (error) {
            console.error('Error saving notifications to storage:', error);
        }
    };

    const handleNewNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            // Check if notification already exists (deduplication by ID)
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                return prev;
            }

            // Add new notification at the beginning
            const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
            saveNotificationsToStorage(updated);

            return updated;
        });
    }, []);

    // WebSocket connection
    const { isConnected, reconnect, disconnect } = useWebSocket({
        onMessage: handleNewNotification,
        onConnect: () => console.log('✅ Notification WebSocket connected'),
        onDisconnect: () => console.log('🔌 Notification WebSocket disconnected'),
    });

    // Simple refresh function to get a fresh socket after sign-in
    const refreshConnection = useCallback(() => {
        try {
            reconnect();
        } catch (error) {
            console.error('Error refreshing WebSocket connection:', error);
        }
    }, [reconnect]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            );
            saveNotificationsToStorage(updated);
            return updated;
        });

        // Sync with backend
        try {
            await apiCall(`/notifications/${id}/read`, { method: 'PATCH' });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const latestTimestamp = notifications[0]?.created_at;

        setNotifications((prev) => {
            const updated = prev.map(n => ({ ...n, is_read: true }));
            saveNotificationsToStorage(updated);
            return updated;
        });

        // Sync with backend
        try {
            await apiCall(`/notifications/read-all${latestTimestamp ? `?timestamp=${latestTimestamp}` : ''}`, {
                method: 'PATCH'
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [notifications]);

    const clearNotifications = useCallback(async () => {
        setNotifications([]);
        await AsyncStorage.removeItem(STORAGE_KEY);
    }, []);

    const refetchNotifications = useCallback(async () => {
        try {
            setNotifications((prev) => {
                const latestTimestamp = prev[0]?.created_at;

                // Fetch in background
                apiCall<Notification[]>(
                    `/notifications${latestTimestamp ? `?timestamp=${latestTimestamp}` : '?limit=50'}`
                ).then((response) => {
                    if (response && Array.isArray(response)) {
                        setNotifications((current) => {
                            // Merge new notifications with existing ones, deduplicate by ID
                            const merged = [...response, ...current];
                            const unique = Array.from(
                                new Map(merged.map(n => [n.id, n])).values()
                            ).slice(0, MAX_NOTIFICATIONS);

                            saveNotificationsToStorage(unique);
                            return unique;
                        });
                    }
                }).catch((error) => {
                    console.error('Error fetching notifications:', error);
                });

                return prev; // Return unchanged
            });
        } catch (error) {
            console.error('Error in refetchNotifications:', error);
        }
    }, []);

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refetchNotifications,
        refreshConnection,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
}
