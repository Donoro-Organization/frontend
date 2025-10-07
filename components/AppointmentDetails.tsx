import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DonorInvitation, InvitationStatus } from '@/types/bloodRequest';
import { format } from 'date-fns';
import DetailsButton from './DetailsButton';

interface AppointmentDetailsProps {
    invitation: DonorInvitation;
    onBack: () => void;
    onConfirm?: () => void;
    onDecline?: () => void;
}

export default function AppointmentDetails({
    invitation,
    onBack,
    onConfirm,
    onDecline,
}: AppointmentDetailsProps) {
    const bloodRequest = invitation.blood_request;
    if (!bloodRequest) return null;

    const getStatusLabel = (status: InvitationStatus): string => {
        switch (status) {
            case InvitationStatus.PENDING:
                return 'Pending';
            case InvitationStatus.ACCEPTED:
                return 'Upcoming';
            case InvitationStatus.COMPLETED:
                return 'Completed';
            case InvitationStatus.CANCELLED:
            case InvitationStatus.REJECTED:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: InvitationStatus): string => {
        switch (status) {
            case InvitationStatus.PENDING:
                return '#D32F2F';
            case InvitationStatus.ACCEPTED:
                return '#2E7D32';
            case InvitationStatus.COMPLETED:
                return '#1976D2';
            case InvitationStatus.CANCELLED:
            case InvitationStatus.REJECTED:
                return '#757575';
            default:
                return '#222';
        }
    };

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return {
                date: format(date, 'dd MMMM yyyy'),
                time: format(date, 'hh:mm a'),
            };
        } catch {
            return { date: dateString, time: '' };
        }
    };

    const showActionButtons = invitation.status === InvitationStatus.PENDING;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={styles.title}>
                    <Text style={[styles.statusText, { color: getStatusColor(invitation.status) }]}>
                        {getStatusLabel(invitation.status)}
                    </Text>
                    <Text style={styles.appointmentText}> Appointment</Text>
                </Text>

                {/* Patient Name */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        {bloodRequest.user?.profile_image?.url ? (
                            <Image
                                source={{ uri: bloodRequest.user.profile_image.url }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={24} color="#666" />
                            </View>
                        )}
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Requester Name</Text>
                        <Text style={styles.infoValue}>
                            {`${bloodRequest.user?.first_name || ''} ${bloodRequest.user?.last_name || ''}`.trim() || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Patient Condition */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="medical" size={24} color="#D32F2F" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Patient Condition</Text>
                        <Text style={styles.infoValue}>
                            {bloodRequest.patient_condition || 'Blood needed'}
                        </Text>
                    </View>
                </View>

                {/* Blood Group */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="water" size={24} color="#D32F2F" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Blood Group Needed</Text>
                        <View style={styles.bloodGroupContainer}>
                            <View style={styles.bloodGroupBadge}>
                                <Text style={styles.bloodGroupText}>{bloodRequest.blood_group}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar" size={24} color="#7C4DFF" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Date & Time</Text>
                        <View style={styles.dateTimeContainer}>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateText}>
                                    {formatDateTime(bloodRequest.required_datetime).date}
                                </Text>
                            </View>
                            <View style={styles.timeBox}>
                                <Text style={styles.timeText}>
                                    {formatDateTime(bloodRequest.required_datetime).time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Note */}
                {invitation.notes && (
                    <View style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="information-circle" size={24} color="#00BCD4" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Note</Text>
                            <Text style={styles.infoValue}>{invitation.notes}</Text>
                        </View>
                    </View>
                )}

                {/* Hospital */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Hospital</Text>
                </View>
                <TouchableOpacity style={styles.hospitalCard}>
                    <View style={styles.hospitalInfo}>
                        <Text style={styles.hospitalName}>{bloodRequest.location}</Text>
                        <Text style={styles.hospitalAddress}>
                            Dhanmondi, Dhaka
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#D32F2F" />
                </TouchableOpacity>

                {/* Action Buttons */}
                {showActionButtons && (
                    <View style={styles.actionButtons}>
                        <DetailsButton
                            text="Confirm Appointment"
                            variant="primary"
                            color="#D32F2F"
                            onPress={onConfirm || (() => { })}
                        />
                        <DetailsButton
                            text="Decline"
                            variant="outlined"
                            color="#D32F2F"
                            onPress={onDecline || (() => { })}
                            style={styles.declineButton}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    statusText: {
        color: '#D32F2F',
    },
    appointmentText: {
        color: '#222',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#999',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    bloodGroupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bloodGroupBadge: {
        backgroundColor: '#D32F2F',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    bloodGroupText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateTimeContainer: {
        gap: 8,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    dateText: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    sectionHeader: {
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    hospitalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    hospitalInfo: {
        flex: 1,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    hospitalAddress: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        marginTop: 32,
        marginBottom: 40,
    },
    declineButton: {
        marginTop: 12,
    },
});
