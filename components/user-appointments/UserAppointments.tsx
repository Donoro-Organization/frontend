import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useAPI, apiCall } from "@/hooks/useAPI";
import {
  BloodRequestStatus,
  ApiResponse,
} from "@/types/bloodRequest";
import PendingRequestCard from "./PendingRequestCard";
import AcceptedRequestCard from "./AcceptedRequestCard";
import CompletedRequestCard from "./CompletedRequestCard";
import CancelledRequestCard from "./CancelledRequestCard";
import RequestDetails from "./RequestDetails";
import { getUserId } from "@/utils/storage";

type StatusTab = "accepted" | "pending" | "completed" | "cancelled";

export default function UserAppointments() {
  const [activeTab, setActiveTab] = useState<StatusTab>("accepted");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  // Load user ID on mount
  React.useEffect(() => {
    const loadUserId = async () => {
      const id = await getUserId();
      setUserID(id);
    };
    loadUserId();
  }, []);

  // Map status tab to API enum
  const getRequestStatus = (tab: StatusTab): BloodRequestStatus => {
    const statusMap: Record<StatusTab, BloodRequestStatus> = {
      accepted: BloodRequestStatus.ACCEPTED,
      pending: BloodRequestStatus.PENDING,
      completed: BloodRequestStatus.COMPLETED,
      cancelled: BloodRequestStatus.CANCELLED,
    };
    return statusMap[tab];
  };

  // Fetch blood requests based on active tab
  const { data, loading, error, refetch } = useAPI<any>(
    `/blood-requests/user/${userID}?request_status=${getRequestStatus(
      activeTab
    )}&page=1&limit=20`,
    { enabled: !!userID }
  );

  const requests = data?.data?.blood_requests || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewDetails = (requestId: string) => {
    const request = requests.find((req: any) => req.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setDetailsModalVisible(true);
    } else {
      Alert.alert("Error", "Request not found");
    }
  };

  const handleSearchDonors = (requestId: string) => {
    Alert.alert("Search Donors", "Search functionality will be implemented");
    // TODO: Navigate to donor search screen or open search modal
  };

  const handleCancelRequest = async (requestId: string) => {
    console.log("handleCancelRequest called with ID:", requestId);

    // Use window.confirm for web, Alert.alert for mobile
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Are you sure you want to cancel this blood request?")
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Cancel Request",
              "Are you sure you want to cancel this blood request?",
              [
                {
                  text: "No",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Yes",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

    if (confirmed) {
      // API call to cancel request
      try {
        console.log("Cancelling request:", requestId);
        console.log("Sending status:", BloodRequestStatus.CANCELLED);

        const response = await apiCall<ApiResponse<any>>(
          `/blood-requests/${requestId}/status`,
          {
            method: "PATCH",
            body: { status: BloodRequestStatus.CANCELLED },
          }
        );

        console.log("Cancel response:", response);

        if (response.status_code === 200) {
          // Close modal if open
          setDetailsModalVisible(false);

          window.alert("Request cancelled successfully");
          // Refresh the list
          await refetch();
        } else {
          window.alert(
            `Error: ${response.message || "Failed to cancel request"}`
          );
        }
      } catch (error) {
        console.error("Error cancelling request:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        window.alert(
          `Failed to cancel request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleMarkComplete = async (requestId: string) => {
    console.log("handleMarkComplete called with ID:", requestId);

    // Use window.confirm for web, Alert.alert for mobile
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm(
            "Are you sure you want to mark this blood request as completed?"
          )
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Mark as Complete",
              "Are you sure you want to mark this blood request as completed?",
              [
                {
                  text: "No",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Yes",
                  style: "default",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

    if (confirmed) {
      // API call to mark request as complete
      try {
        console.log("Marking request as complete:", requestId);
        console.log("Sending status:", BloodRequestStatus.COMPLETED);

        const response = await apiCall<ApiResponse<any>>(
          `/blood-requests/${requestId}/status`,
          {
            method: "PATCH",
            body: { status: BloodRequestStatus.COMPLETED },
          }
        );

        console.log("Mark complete response:", response);

        if (response.status_code === 200) {
          // Close modal if open
          setDetailsModalVisible(false);

          window.alert("Request marked as completed successfully");
          // Refresh the list
          await refetch();
        } else {
          window.alert(
            `Error: ${response.message || "Failed to mark request as complete"}`
          );
        }
      } catch (error) {
        console.error("Error marking request as complete:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        window.alert(
          `Failed to mark request as complete: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const renderTabButton = (tab: StatusTab, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRequestCard = (request: any) => {
    const status = request.status as BloodRequestStatus;

    switch (status) {
      case BloodRequestStatus.PENDING:
        return (
          <PendingRequestCard
            key={request.id}
            request={request}
            onViewDetails={handleViewDetails}
            onCancel={handleCancelRequest}
          />
        );
      case BloodRequestStatus.ACCEPTED:
        return (
          <AcceptedRequestCard
            key={request.id}
            request={request}
            onViewDetails={handleViewDetails}
            onCancel={handleCancelRequest}
            onMarkComplete={handleMarkComplete}
          />
        );
      case BloodRequestStatus.COMPLETED:
        return (
          <CompletedRequestCard
            key={request.id}
            request={request}
            onViewDetails={handleViewDetails}
          />
        );
      case BloodRequestStatus.CANCELLED:
        return (
          <CancelledRequestCard
            key={request.id}
            request={request}
            onViewDetails={handleViewDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Blood Requests</Text>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          {renderTabButton("accepted", "Upcoming")}
          {renderTabButton("pending", "Pending")}
          {renderTabButton("completed", "Completed")}
          {renderTabButton("cancelled", "Cancelled")}
        </View>
      </View>

      {/* Request List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#D32F2F"]}
            tintColor="#D32F2F"
          />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D32F2F" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load requests</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {activeTab === "pending" && "No pending requests"}
              {activeTab === "accepted" && "No accepted requests"}
              {activeTab === "completed" && "No completed requests"}
              {activeTab === "cancelled" && "No cancelled requests"}
            </Text>
          </View>
        )}

        {!loading && !error && requests.map(renderRequestCard)}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        {selectedRequest && (
          <RequestDetails
            request={selectedRequest}
            onBack={() => setDetailsModalVisible(false)}
            onSearchDonors={handleSearchDonors}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    width: "100%",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  activeTabButton: {
    backgroundColor: "#D32F2F",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabButtonText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#D32F2F",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
