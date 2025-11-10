export type NotificationCategory =
  | "general"
  | "request"
  | "acceptance"
  | "rejection"
  | "review"
  | "auth"
  | "system";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  category: NotificationCategory;
  is_read: boolean;
  created_at: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  refetchNotifications: () => Promise<void>;
  refreshConnection: () => void;
}

// Icon mapping for notification categories
// Using Ionicons - you can easily add/modify icons here
export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, string> =
  {
    general: "notifications-outline",
    request: "water-outline", // Blood request
    acceptance: "checkmark-circle-outline",
    rejection: "close-circle-outline",
    review: "star-outline",
    auth: "person-outline",
    system: "settings-outline",
  };

// Icon colors for notification categories
export const NOTIFICATION_CATEGORY_COLORS: Record<
  NotificationCategory,
  string
> = {
  general: "#888",
  request: "#D32F2F", // Red for blood requests
  acceptance: "#4CAF50", // Green for accepted
  rejection: "#FF5252", // Red for rejected
  review: "#FFB300", // Gold for reviews
  auth: "#2196F3", // Blue for auth
  system: "#9E9E9E", // Gray for system
};
