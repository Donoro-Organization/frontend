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
import AppointmentDetails from '../AppointmentDetails';
import { getUserId } from '@/utils/storage';

// Set to true to use mock data instead of API
const USE_MOCK_DATA = true;

type StatusTab = 'accepted' | 'pending' | 'completed' | 'cancelled';


// Mock data for each status
const MOCK_DATA: Record<StatusTab, DonorInvitation[]> = {
    pending: [
        {
            id: '1',
            donor_id: 'donor-1',
            blood_request_id: 'req-1',
            status: InvitationStatus.PENDING,
            notes: 'Emergency case, patient in critical condition. Please respond ASAP.',
            sent_at: new Date().toISOString(),
            blood_request: {
                id: 'req-1',
                user_id: 'user-1',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Delivery Patient, Heavy Blood Loss',
                location: 'Anowar Khan Medical College',
                latitude: '23.7515',
                longitude: '90.3777',
                required_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                quantity: 2,
                status: BloodRequestStatus.PENDING,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: {
                    id: 'user-1',
                    email: 'fatima@example.com',
                    first_name: 'Fatima',
                    last_name: 'Rahman',
                    phone: '+880 1712-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '2',
            donor_id: 'donor-1',
            blood_request_id: 'req-2',
            status: InvitationStatus.PENDING,
            notes: 'Accident patient needs immediate blood transfusion.',
            sent_at: new Date().toISOString(),
            blood_request: {
                id: 'req-2',
                user_id: 'user-2',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Emergency Bike Accident',
                location: 'Dhaka Medical College Hospital',
                latitude: '23.7272',
                longitude: '90.3982',
                required_datetime: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
                quantity: 1,
                status: BloodRequestStatus.PENDING,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: {
                    id: 'user-2',
                    email: 'karim@example.com',
                    first_name: 'Karim',
                    last_name: 'Ahmed',
                    phone: '+880 1812-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '3',
            donor_id: 'donor-1',
            blood_request_id: 'req-3',
            status: InvitationStatus.PENDING,
            sent_at: new Date().toISOString(),
            blood_request: {
                id: 'req-3',
                user_id: 'user-3',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Surgery Patient',
                location: 'Square Hospital, Panthapath',
                latitude: '23.7539',
                longitude: '90.3816',
                required_datetime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                quantity: 1,
                status: BloodRequestStatus.PENDING,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: {
                    id: 'user-3',
                    email: 'nusrat@example.com',
                    first_name: 'Nusrat',
                    last_name: 'Jahan',
                    phone: '+880 1912-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
    ],
    accepted: [
        {
            id: '4',
            donor_id: 'donor-1',
            blood_request_id: 'req-4',
            status: InvitationStatus.ACCEPTED,
            notes: 'Thank you for accepting. Please arrive 30 minutes early.',
            sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-4',
                user_id: 'user-4',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Thalassemia Patient, Regular Transfusion',
                location: 'Bangabandhu Sheikh Mujib Medical University',
                latitude: '23.7387',
                longitude: '90.3958',
                required_datetime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Today evening
                quantity: 2,
                status: BloodRequestStatus.ACCEPTED,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-4',
                    email: 'shahid@example.com',
                    first_name: 'Md. Shahid',
                    last_name: 'Islam',
                    phone: '+880 1612-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    profile_image: {
                        id: 'file-1',
                        name: 'profile.jpg',
                        url: 'https://via.placeholder.com/100',
                        is_deleted: false,
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '5',
            donor_id: 'donor-1',
            blood_request_id: 'req-5',
            status: InvitationStatus.ACCEPTED,
            sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-5',
                user_id: 'user-5',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Cancer Patient - Chemotherapy',
                location: 'National Institute of Cancer Research',
                latitude: '23.7654',
                longitude: '90.3625',
                required_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
                quantity: 1,
                status: BloodRequestStatus.ACCEPTED,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-5',
                    email: 'ayesha@example.com',
                    first_name: 'Ayesha',
                    last_name: 'Siddiqua',
                    phone: '+880 1512-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
    ],
    completed: [
        {
            id: '6',
            donor_id: 'donor-1',
            blood_request_id: 'req-6',
            status: InvitationStatus.COMPLETED,
            sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-6',
                user_id: 'user-6',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Post-Surgery Recovery',
                location: 'United Hospital, Gulshan',
                latitude: '23.7805',
                longitude: '90.4113',
                required_datetime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                quantity: 1,
                status: BloodRequestStatus.COMPLETED,
                created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-6',
                    email: 'rafiq@example.com',
                    first_name: 'Rafiq',
                    last_name: 'Hossain',
                    phone: '+880 1312-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '7',
            donor_id: 'donor-1',
            blood_request_id: 'req-7',
            status: InvitationStatus.COMPLETED,
            notes: 'Your donation saved a life. Thank you!',
            sent_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-7',
                user_id: 'user-7',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Dengue Patient - Severe',
                location: 'Holy Family Red Crescent Hospital',
                latitude: '23.7616',
                longitude: '90.3872',
                required_datetime: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
                quantity: 2,
                status: BloodRequestStatus.COMPLETED,
                created_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-7',
                    email: 'sultana@example.com',
                    first_name: 'Sultana',
                    last_name: 'Begum',
                    phone: '+880 1412-345678',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '8',
            donor_id: 'donor-1',
            blood_request_id: 'req-8',
            status: InvitationStatus.COMPLETED,
            sent_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-8',
                user_id: 'user-8',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Road Accident Victim',
                location: 'Dhaka Medical College Hospital',
                latitude: '23.7272',
                longitude: '90.3982',
                required_datetime: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(), // ~2 months ago
                quantity: 1,
                status: BloodRequestStatus.COMPLETED,
                created_at: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-8',
                    email: 'habib@example.com',
                    first_name: 'Habib',
                    last_name: 'Rahman',
                    phone: '+880 1712-987654',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
    ],
    cancelled: [
        {
            id: '9',
            donor_id: 'donor-1',
            blood_request_id: 'req-9',
            status: InvitationStatus.REJECTED,
            sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            responded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-9',
                user_id: 'user-9',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Elective Surgery',
                location: 'Apollo Hospital, Bashundhara',
                latitude: '23.8103',
                longitude: '90.4125',
                required_datetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                quantity: 1,
                status: BloodRequestStatus.CANCELLED,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-9',
                    email: 'nasir@example.com',
                    first_name: 'Nasir',
                    last_name: 'Uddin',
                    phone: '+880 1812-987654',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
        {
            id: '10',
            donor_id: 'donor-1',
            blood_request_id: 'req-10',
            status: InvitationStatus.CANCELLED,
            sent_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            blood_request: {
                id: 'req-10',
                user_id: 'user-10',
                blood_group: BloodGroup.A_POSITIVE,
                patient_condition: 'Minor Surgery - Cancelled by patient',
                location: 'LabAid Hospital, Dhanmondi',
                latitude: '23.7459',
                longitude: '90.3772',
                required_datetime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                quantity: 1,
                status: BloodRequestStatus.CANCELLED,
                created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                user: {
                    id: 'user-10',
                    email: 'meher@example.com',
                    first_name: 'Meher',
                    last_name: 'Afroz',
                    phone: '+880 1912-987654',
                    role: UserRole.GENERAL,
                    verified: true,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        },
    ],
};

export default function DonorAppointments() {
    const [activeTab, setActiveTab] = useState<StatusTab>('accepted');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [mockInvitations, setMockInvitations] = useState(MOCK_DATA);
    const [selectedInvitation, setSelectedInvitation] = useState<DonorInvitation | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [donorUserId, setDonorUserId] = useState<string | null>(null);

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
        { enabled: !USE_MOCK_DATA && !!donorUserId }
    );

    const invitations = USE_MOCK_DATA
        ? mockInvitations[activeTab]
        : (data?.data?.invitations || []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            await refetch();
        }
        setIsRefreshing(false);
    };

    const handleAccept = async (invitationId: string) => {
        if (USE_MOCK_DATA) {
            // Mock data handling
            Alert.alert('Success', 'Invitation accepted successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Move from pending to accepted
                        const invitation = mockInvitations.pending.find(inv => inv.id === invitationId);
                        if (invitation) {
                            setMockInvitations(prev => ({
                                ...prev,
                                pending: prev.pending.filter(inv => inv.id !== invitationId),
                                accepted: [...prev.accepted, { ...invitation, status: InvitationStatus.ACCEPTED, responded_at: new Date().toISOString() }],
                            }));
                        }
                    },
                },
            ]);
            return;
        }

        try {
            const response = await apiCall<ApiResponse<any>>(
                `/blood-requests/invitation/${invitationId}/accept`,
                {
                    method: 'PUT',
                }
            );

            if (response.status_code === 200) {
                Alert.alert('Success', 'Invitation accepted successfully!');
                refetch();
            } else {
                Alert.alert('Error', response.message || 'Failed to accept invitation');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to accept invitation. Please try again.');
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
                        if (USE_MOCK_DATA) {
                            // Mock data handling
                            const invitation = mockInvitations.pending.find(inv => inv.id === invitationId);
                            if (invitation) {
                                setMockInvitations(prev => ({
                                    ...prev,
                                    pending: prev.pending.filter(inv => inv.id !== invitationId),
                                    cancelled: [...prev.cancelled, { ...invitation, status: InvitationStatus.REJECTED, responded_at: new Date().toISOString() }],
                                }));
                                Alert.alert('Success', 'Invitation declined');
                            }
                            return;
                        }

                        try {
                            const response = await apiCall<ApiResponse<any>>(
                                `/blood-requests/invitation/${invitationId}/reject`,
                                {
                                    method: 'PUT',
                                }
                            );

                            if (response.status_code === 200) {
                                Alert.alert('Success', 'Invitation declined');
                                refetch();
                            } else {
                                Alert.alert('Error', response.message || 'Failed to decline invitation');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to decline invitation. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleViewDetails = (invitationId: string) => {
        // Find the invitation in current data (either mock or API)
        const invitation = invitations.find(inv => inv.id === invitationId);
        if (invitation) {
            setSelectedInvitation(invitation);
            setDetailsModalVisible(true);
        } else {
            Alert.alert('Error', 'Invitation not found');
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

    const renderTabButton = (tab: StatusTab, label: string) => (
        <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
        >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Appointments</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScrollContent}
                >
                    {renderTabButton('accepted', 'Upcoming')}
                    {renderTabButton('pending', 'Pending')}
                    {renderTabButton('completed', 'Completed')}
                    {renderTabButton('cancelled', 'Cancelled')}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                {loading && !isRefreshing && !USE_MOCK_DATA && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#D32F2F" />
                        <Text style={styles.loadingText}>Loading appointments...</Text>
                    </View>
                )}

                {error && !loading && !USE_MOCK_DATA && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load appointments</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(USE_MOCK_DATA || (!loading && !error)) && invitations.length === 0 && (
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

                {(USE_MOCK_DATA || (!loading && !error)) && invitations.length > 0 && (
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#222',
    },
    tabContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        alignItems: 'center',
    },
    tabScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        flexGrow: 0,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    activeTabButton: {
        backgroundColor: '#D32F2F',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
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
