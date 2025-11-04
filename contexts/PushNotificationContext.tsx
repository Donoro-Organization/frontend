import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { apiCall } from '@/hooks/useAPI';
import * as Crypto from 'expo-crypto';
import { DeviceRegistrationRequest, DeviceCheckResponse, DevicePlatform } from '@/types/device';
import { router } from 'expo-router';

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

const DEVICE_ID_KEY = '@device_id';
const FCM_TOKEN_KEY = '@fcm_token';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface PushNotificationContextType {
    expoPushToken: string | null;
    deviceId: string | null;
    notification: Notifications.Notification | null;
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [isCheckingInitialNotification, setIsCheckingInitialNotification] = useState(true);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const hasHandledInitialNotification = useRef(false);

    // Handle notification response (tap)
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        console.log('Handling notification tap:', response);

        const data = response.notification.request.content.data;
        const notificationId = data?.id as string;
        const link = data?.link as string;

        // Mark notification as read in background (non-blocking)
        if (notificationId) {
            // Fire and forget - don't wait for completion
            (async () => {
                try {
                    await apiCall(`/notifications/${notificationId}/read`, {
                        method: 'PATCH'
                    });
                    console.log('Notification marked as read:', notificationId);

                    // Update local storage
                    const stored = await AsyncStorage.getItem('@notifications');
                    if (stored) {
                        const notifications = JSON.parse(stored);
                        const updated = notifications.map((n: any) =>
                            n.id === notificationId ? { ...n, is_read: true } : n
                        );
                        await AsyncStorage.setItem('@notifications', JSON.stringify(updated));
                    }
                } catch (error) {
                    console.error('Error marking notification as read:', error);
                }
            })();
        }

        // Navigate immediately (don't wait for mark as read)
        if (link) {
            console.log('Navigating to:', link);
            try {
                router.push(link as any);
            } catch (error) {
                console.error('Navigation error:', error);
                // Fallback to notifications page if navigation fails
                router.push('/notifications' as any);
            }
        } else {
            // Default: navigate to notifications page if no link provided
            console.log('No link found, navigating to notifications');
            router.push('/notifications' as any);
        }
    };

    // Check for notification that launched the app (cold start)
    useEffect(() => {
        const checkInitialNotification = async () => {
            if (hasHandledInitialNotification.current) {
                setIsCheckingInitialNotification(false);
                return;
            }

            try {
                const response = await Notifications.getLastNotificationResponseAsync();

                if (response) {
                    console.log('App launched from notification (cold start):', response);
                    hasHandledInitialNotification.current = true;

                    // Show app immediately
                    setIsCheckingInitialNotification(false);

                    // Navigate ASAP - use minimal delay for router to be ready
                    // This will cause a brief home screen flash, but it's the only reliable way
                    setTimeout(() => {
                        handleNotificationResponse(response);
                    }, 300); 
                } else {
                    console.log('No initial notification found');
                    setIsCheckingInitialNotification(false);
                }
            } catch (error) {
                console.error('Error checking initial notification:', error);
                setIsCheckingInitialNotification(false);
            }
        };

        // Check immediately on mount
        checkInitialNotification();
    }, []);

    useEffect(() => {
        initializePushNotifications();

        // Listen for notifications received while app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received in foreground:', notification);
            setNotification(notification);
        });

        // Listen for user tapping on notification (app in foreground or background)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification tapped (app running):', response);
            handleNotificationResponse(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const initializePushNotifications = async () => {
        try {
            // Step 1: Generate or retrieve device ID
            const deviceIdResult = await getOrCreateDeviceId();
            setDeviceId(deviceIdResult);

            // Step 2: Register for push notifications
            const token = await registerForPushNotificationsAsync();
            if (!token) {
                console.log('Failed to get push token');
                return;
            }
            setExpoPushToken(token);

            // Step 3: Check if device exists on backend
            const shouldUpdate = await checkDeviceOnBackend(deviceIdResult, token);

            // Step 4: Register or update device on backend
            if (shouldUpdate) {
                await registerDeviceOnBackend(deviceIdResult, token);
            }

            // Step 5: Save token to AsyncStorage
            await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    };

    const getOrCreateDeviceId = async (): Promise<string> => {
        // 1. Try to get from local storage first
        const storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (storedDeviceId) {
            console.log('Using stored device ID:', storedDeviceId);
            return storedDeviceId;
        }

        let deviceId: string | null = null;

        // 2. Try to get hardware-based ID (survives reinstall)
        try {
            if (Platform.OS === 'android') {
                // Android: Use ANDROID_ID (survives reinstall, but not factory reset)
                const androidId = await DeviceInfo.getAndroidId();
                // Convert short hex to full UUID format by hashing it
                const hashHex = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    androidId
                );
                deviceId = formatHashAsUUID(hashHex);
                console.log('Using Android hardware ID (converted to UUID):', deviceId);
            } else if (Platform.OS === 'ios') {
                // iOS: Use identifierForVendor (survives reinstall)
                const uniqueId = await DeviceInfo.getUniqueId();
                deviceId = uniqueId;
                console.log('Using iOS unique ID:', deviceId);
            }
        } catch (error) {
            console.log('Hardware ID not available:', error);
        }

        // 3. Fallback: Generate ID from device specs hash (not random)
        if (!deviceId) {
            try {
                const deviceInfo = {
                    brand: Device.brand || 'Unknown',
                    model: Device.modelName || 'Unknown',
                    os: Device.osName || Platform.OS,
                    osVersion: Device.osVersion || 'Unknown',
                };

                // Create consistent hash from device info
                const deviceString = JSON.stringify(deviceInfo);
                const hashHex = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    deviceString
                );

                // Format as UUID
                deviceId = formatHashAsUUID(hashHex);
                console.log('Generated hash-based device ID from specs:', deviceId);
            } catch (error) {
                console.error('Failed to generate hash-based ID:', error);
                // Last resort: random UUID (should rarely happen)
                deviceId = generateUUID();
                console.log('Using random UUID as last resort:', deviceId);
            }
        }

        // 4. Save to storage for faster access next time
        if (deviceId) {
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
            return deviceId;
        }

        // This should never happen, but just in case
        const fallbackId = generateUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
        return fallbackId;
    };

    const registerForPushNotificationsAsync = async (): Promise<string | null> => {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token - permission denied');
                return null;
            }

            // For Android, set notification channel first
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            // Get native FCM token (not Expo token)
            let fcmToken: string | null = null;

            if (Platform.OS === 'android') {
                // For Android, get native FCM token
                try {
                    const token = await Notifications.getDevicePushTokenAsync();
                    fcmToken = token.data;
                    console.log('Got native FCM token:', fcmToken);
                } catch (error) {
                    console.error('Failed to get FCM token:', error);
                }
            }

            // Fallback to Expo token if FCM token not available
            if (!fcmToken) {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                });
                fcmToken = tokenData.data;
                console.log('Using Expo push token:', fcmToken);
            }

            return fcmToken;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    };

    const checkDeviceOnBackend = async (deviceId: string, token: string): Promise<boolean> => {
        try {
            const response = await apiCall<DeviceCheckResponse>(
                `/devices/check/${deviceId}`,
            );

            if (!response || !response.exists || !response.last_active_at) {
                console.log('Device not found on backend, will register');
                return true;
            }

            // Check if last_active_at is older than 30 days
            const lastActive = new Date(response.last_active_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (lastActive < thirtyDaysAgo) {
                console.log('Device token is older than 30 days, will update');
                return true;
            }

            console.log('Device is up to date on backend');
            return false;
        } catch (error) {
            console.error('Error checking device on backend:', error);
            // If check fails, try to register anyway
            return true;
        }
    };

    const registerDeviceOnBackend = async (deviceId: string, token: string) => {
        try {
            const deviceInfo: DeviceRegistrationRequest = {
                device_id: deviceId,
                fcm_token: token,
                model: Device.modelName || 'Unknown',
                platform: (Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web') as DevicePlatform,
            };


            const response = await apiCall('/devices/register', {
                method: 'POST',
                body: deviceInfo,
            });

            console.log('Device registered successfully on backend');
        } catch (error) {
            console.error('Error registering device on backend:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        }
    };

    const value: PushNotificationContextType = {
        expoPushToken,
        deviceId,
        notification,
    };

    // Show loading spinner while checking for initial notification to prevent flash
    if (isCheckingInitialNotification) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
            </View>
        );
    }

    return (
        <PushNotificationContext.Provider value={value}>
            {children}
        </PushNotificationContext.Provider>
    );
}

export function usePushNotifications() {
    const context = useContext(PushNotificationContext);
    if (!context) {
        throw new Error('usePushNotifications must be used within PushNotificationProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

// Utility functions
function formatHashAsUUID(hashHex: string): string {
    // Take first 32 characters of the hash
    const hex = hashHex.slice(0, 32);

    // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

function formatAsUUID(hash: number): string {
    // Convert hash to hex and pad
    const hex = hash.toString(16).padStart(32, '0');

    // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
