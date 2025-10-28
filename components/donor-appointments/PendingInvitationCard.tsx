import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DonorInvitation, BloodGroup } from '@/types/bloodRequest';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import DetailsButton from '../DetailsButton';

interface PendingInvitationCardProps {
    invitation: DonorInvitation;
    onAccept: (invitationId: string) => void;
    onReject: (invitationId: string) => void;
    onViewDetails: (invitationId: string) => void;
}

export default function PendingInvitationCard({
    invitation,
    onAccept,
    onReject,
    onViewDetails,
}: PendingInvitationCardProps) {
    const bloodRequest = invitation.blood_request;
    if (!bloodRequest) return null;

    const getBloodGroupIcon = (bloodGroup: BloodGroup): string => {
        return bloodGroup;
    };

    const getDay = (dateString: string) => {
        try {
            return format(new Date(dateString), 'd');
        } catch {
            return '?';
        }
    };

    const getMonth = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM');
        } catch {
            return '';
        }
    };

    const getTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'hh:mm a');
        } catch {
            return '';
        }
    };

    return (
        <View style={styles.card}>
            {/* Top Section: Date + Content */}
            <View style={styles.topSection}>
                {/* Left: Date Badge */}
                <View style={styles.dateSection}>
                    <Text style={styles.dateDay}>{getDay(bloodRequest.required_datetime)}</Text>
                    <Text style={styles.dateMonth}>{getMonth(bloodRequest.required_datetime)}</Text>
                </View>

                {/* Right: Content Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.hospitalName} numberOfLines={1}>
                        {bloodRequest.location}
                    </Text>
                    <Text style={styles.condition} numberOfLines={1}>
                        {bloodRequest.patient_condition || 'Blood needed'}
                    </Text>

                    {/* Blood Type and Time Row */}
                    <View style={styles.infoRow}>
                        <View style={styles.bloodBadge}>
                            <Text style={styles.bloodText}>{getBloodGroupIcon(bloodRequest.blood_group)}</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.timeText}>{getTime(bloodRequest.required_datetime)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Section: Action Buttons */}
            <View style={styles.bottomSection}>
                {/* Details Button - Full Width */}
                <DetailsButton
                    onPress={() => onViewDetails(invitation.id)}
                    color="#D32F2F"
                />

                {/* Accept and Reject Buttons Row */}
                <View style={styles.actionButtonRow}>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => onReject(invitation.id)}
                    >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => onAccept(invitation.id)}
                    >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topSection: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    dateSection: {
        width: 80,
        minHeight: 90,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFE8E8',
        borderRadius: 12,
        marginRight: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    dateDay: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#D32F2F',
        lineHeight: 40,
    },
    dateMonth: {
        fontSize: 15,
        fontWeight: '600',
        color: '#D32F2F',
        marginTop: 0,
    },
    detailsSection: {
        flex: 1,
        justifyContent: 'center',
    },
    bottomSection: {
        width: '100%',
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    condition: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bloodBadge: {
        backgroundColor: '#D32F2F',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    bloodText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginLeft: 1,
    },
    actionButtonRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D32F2F',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D32F2F',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#D32F2F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
