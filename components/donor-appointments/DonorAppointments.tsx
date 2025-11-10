import React, { useState } from 'react';
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
} from 'react-native';
import { useAPI, apiCall } from '@/hooks/useAPI';
import {
    InvitationStatus,
    ApiResponse,
    PaginatedInvitationsResponse,
    DonorInvitation,
    BloodGroup,
    BloodRequestStatus,
} from '@/types/bloodRequest';
import { UserRole } from '@/types/user';
import PendingInvitationCard from './PendingInvitationCard';
import AcceptedInvitationCard from './AcceptedInvitationCard';
import CompletedInvitationCard from './CompletedInvitationCard';
import CancelledInvitationCard from './CancelledInvitationCard';
import AppointmentDetails from './AppointmentDetails';
import { getUserId } from '@/utils/storage';
import ErrorDialog from '@/components/ErrorDialog';
import SuccessDialog from '@/components/SuccessDialog';
import StatusTabs from '@/components/StatusTabs';


type StatusTab = 'accepted' | 'pending' | 'completed' | 'cancelled';

export default function DonorAppointments() {
    const [activeTab, setActiveTab] = useState<StatusTab>('accepted');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedInvitation, setSelectedInvitation] = useState<DonorInvitation | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [donorUserId, setDonorUserId] = useState<string | null>(null);
    const [errorDialogVisible, setErrorDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successDialogVisible, setSuccessDialogVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Load user ID on mount
    React.useEffect(() => {
        const loadUserId = async () => {
            const id = await getUserId();
            setDonorUserId(id);
        };
        loadUserId();
    }, []);

    // Map status tab to API enum
    const getInvitationStatus = (tab: StatusTab): InvitationStatus => {
        const statusMap: Record<StatusTab, InvitationStatus> = {
            accepted: InvitationStatus.ACCEPTED,
            pending: InvitationStatus.PENDING,
            completed: InvitationStatus.COMPLETED,
            cancelled: InvitationStatus.CANCELLED,
        };
        return statusMap[tab];
    };

    // Fetch invitations based on active tab
    const { data, loading, error, refetch } = useAPI<ApiResponse<PaginatedInvitationsResponse>>(
        `/blood-requests/donor/${donorUserId || 'pending'}/invitations?invitation_status=${getInvitationStatus(activeTab)}&page=1&limit=20`,
        { enabled: !!donorUserId }
    );

    const invitations = data?.data?.invitations || [];

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const handleAccept = async (invitationId: string) => {

        try {
            const response = await apiCall<ApiResponse<any>>(
                `/blood-requests/invitation/${invitationId}/accept`,
                {
                    method: 'PUT',
                }
            );

            if (response.status_code === 200) {
                setSuccessMessage('Invitation accepted successfully!');
                setSuccessDialogVisible(true);
                refetch();
            } else {
                setErrorMessage(response.message || 'Failed to accept invitation');
                setErrorDialogVisible(true);
            }
        } catch (err) {
            setErrorMessage('Failed to accept invitation. Please try again.');
            setErrorDialogVisible(true);
        }
    };

    const handleReject = async (invitationId: string) => {
        Alert.alert(
            'Decline Invitation',
            'Are you sure you want to decline this invitation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiCall<ApiResponse<any>>(
                                `/blood-requests/invitation/${invitationId}/reject`,
                                {
                                    method: 'PUT',
                                }
                            );

                            if (response.status_code === 200) {
                                setSuccessMessage('Invitation declined');
                                setSuccessDialogVisible(true);
                                refetch();
                            } else {
                                setErrorMessage(response.message || 'Failed to decline invitation');
                                setErrorDialogVisible(true);
                            }
                        } catch (err) {
                            setErrorMessage('Failed to decline invitation. Please try again.');
                            setErrorDialogVisible(true);
                        }
                    },
                },
            ]
        );
    };

    const handleViewDetails = (invitationId: string) => {
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (invitation) {
            setSelectedInvitation(invitation);
            setDetailsModalVisible(true);
        } else {
            setErrorMessage('Invitation not found');
            setErrorDialogVisible(true);
        }
    };

    const handleConfirmAppointment = () => {
        if (selectedInvitation) {
            handleAccept(selectedInvitation.id);
            setDetailsModalVisible(false);
        }
    };

    const handleDeclineAppointment = () => {
        if (selectedInvitation) {
            handleReject(selectedInvitation.id);
            setDetailsModalVisible(false);
        }
    };

    const tabs = [
        { key: 'accepted' as StatusTab, label: 'Upcoming' },
        { key: 'pending' as StatusTab, label: 'Pending' },
        { key: 'completed' as StatusTab, label: 'Completed' },
        { key: 'cancelled' as StatusTab, label: 'Cancelled' },
    ];

    const renderInvitationCard = (invitation: any, index: number) => {
        switch (activeTab) {
            case 'pending':
                return (
                    <PendingInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onViewDetails={handleViewDetails}
                    />
                );
            case 'accepted':
                return (
                    <AcceptedInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onViewDetails={handleViewDetails}
                    />
                );
            case 'completed':
                return (
                    <CompletedInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onViewDetails={handleViewDetails}
                    />
                );
            case 'cancelled':
                return (
                    <CancelledInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        onViewDetails={handleViewDetails}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {loading && !isRefreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D32F2F" />
                        <Text style={styles.loadingText}>Loading appointments...</Text>
                    </View>
                )}

                {error && !loading && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load appointments</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(!loading && !error) && invitations.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'accepted' && 'No upcoming appointments'}
                            {activeTab === 'pending' && 'No pending invitations'}
                            {activeTab === 'completed' && 'No completed donations yet'}
                            {activeTab === 'cancelled' && 'No cancelled appointments'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {activeTab === 'accepted' && 'Confirmed appointments will appear here'}
                            {activeTab === 'pending' && 'New invitations will appear here'}
                            {activeTab === 'completed' && 'Your donation history will appear here'}
                            {activeTab === 'cancelled' && 'Cancelled invitations will appear here'}
                        </Text>
                    </View>
                )}

                {(!loading && !error) && invitations.length > 0 && (
                    <>
                        {/* Invitation Cards */}
                        {invitations.map((invitation, index) =>
                            renderInvitationCard(invitation, index)
                        )}
                    </>
                )}
            </ScrollView>

            {/* Details Modal */}
            <Modal
                visible={detailsModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                {selectedInvitation && (
                    <AppointmentDetails
                        invitation={selectedInvitation}
                        onBack={() => setDetailsModalVisible(false)}
                        onConfirm={handleConfirmAppointment}
                        onDecline={handleDeclineAppointment}
                    />
                )}
            </Modal>

            {/* Error Dialog */}
            <ErrorDialog
                visible={errorDialogVisible}
                message={errorMessage}
                onClose={() => setErrorDialogVisible(false)}
            />

            {/* Success Dialog */}
            <SuccessDialog
                visible={successDialogVisible}
                message={successMessage}
                onClose={() => setSuccessDialogVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: 20,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#D32F2F',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});
