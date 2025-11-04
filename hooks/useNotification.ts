import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "@/hooks/useAPI";

/**
 * Hook to observe notification taps and handle navigation
 * Follows Expo documentation pattern for notification handling
 */
export function useNotificationObserver() {
  useEffect(() => {
    // Helper function to mark notification as read (completely separate, non-blocking)
    function markAsRead(notificationId: string) {
      // Fire and forget - no await, no blocking
      apiCall(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
        .then(() => {
          console.log("Notification marked as read:", notificationId);
          // Update local storage
          AsyncStorage.getItem("@notifications").then((stored) => {
            if (stored) {
              const notifications = JSON.parse(stored);
              const updated = notifications.map((n: any) =>
                n.id === notificationId ? { ...n, is_read: true } : n
              );
              AsyncStorage.setItem("@notifications", JSON.stringify(updated));
            }
          });
        })
        .catch((error) => {
          console.error("Error marking notification as read:", error);
        });
    }

    function redirect(notification: Notifications.Notification) {
      const data = notification.request.content.data;
      const deepLink = data?.deep_link;
      const notificationId = data?.id;

      // Mark as read immediately (non-blocking)
      if (typeof notificationId === "string") {
        markAsRead(notificationId);
      }

      // Navigate immediately (don't wait for anything)
      if (typeof deepLink === "string") {
        console.log("Redirecting to deep link:", deepLink);
        router.push(deepLink as any);
      }
    }

    // Check if app was opened by tapping a notification (cold start)
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    // Listen for notification taps while app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
