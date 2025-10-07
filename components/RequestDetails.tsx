import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BloodRequestStatus } from '@/types/bloodRequest';
import { format } from 'date-fns';

interface RequestDetailsProps {
    request: any;
    onBack: () => void;
    onSearchDonors?: (requestId: string) => void;
}

export default function RequestDetails({
    request,
    onBack,
    onSearchDonors,
}: RequestDetailsProps) {
    const getStatusLabel = (status: BloodRequestStatus): string => {
        switch (status) {
            case BloodRequestStatus.PENDING:
                return 'Pending';
            case BloodRequestStatus.ACCEPTED:
                return 'Upcoming';
            case BloodRequestStatus.COMPLETED:
                return 'Completed';
            case BloodRequestStatus.CANCELLED:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: BloodRequestStatus): string => {
        switch (status) {
            case BloodRequestStatus.PENDING:
                return '#D32F2F';
            case BloodRequestStatus.ACCEPTED:
                return '#2E7D32';
            case BloodRequestStatus.COMPLETED:
                return '#1976D2';
            case BloodRequestStatus.CANCELLED:
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

    const handleCall = (phone: string | null) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert('No Phone', 'Phone number not available');
        }
    };

    const handleMessage = (phone: string | null) => {
        if (phone) {
            Linking.openURL(`sms:${phone}`);
        } else {
            Alert.alert('No Phone', 'Phone number not available');
        }
    };

    const handleViewProfile = (donorId: string) => {
        Alert.alert('View Profile', `Profile view for donor ${donorId} will be implemented`);
    };

    const donors = request.donors || [];

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
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                        {getStatusLabel(request.status)}
                    </Text>
                    <Text style={styles.requestText}> Request</Text>
                </Text>

                {/* Hospital Location */}
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="location" size={24} color="#D32F2F" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Hospital Location</Text>
                        <Text style={styles.infoValue}>{request.location}</Text>
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
                            {request.patient_condition || 'Blood needed'}
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
                                <Text style={styles.bloodGroupText}>{request.blood_group}</Text>
                            </View>
                            <Text style={styles.quantityText}>
                                {request.quantity} {request.quantity === 1 ? 'unit' : 'units'} needed
                            </Text>
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
                                    {formatDateTime(request.required_datetime).date}
                                </Text>
                            </View>
                            <View style={styles.timeBox}>
                                <Text style={styles.timeText}>
                                    {formatDateTime(request.required_datetime).time}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Donors Button - Only show for pending requests */}
                {request.status === BloodRequestStatus.PENDING && onSearchDonors && (
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => onSearchDonors(request.id)}
                    >
                        <Ionicons name="search" size={20} color="#fff" />
                        <Text style={styles.searchButtonText}>Search Donors</Text>
                    </TouchableOpacity>
                )}

                {/* Accepted Donors Section */}
                {donors.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Accepted Donors ({donors.length})
                            </Text>
                        </View>

                        {donors.map((donor: any, index: number) => (
                            <View key={donor.id} style={styles.donorCard}>
                                <View style={styles.donorInfo}>
                                    {donor.user?.profile_image?.url ? (
                                        <Image
                                            source={{ uri: donor.user.profile_image.url }}
                                            style={styles.donorAvatar}
                                        />
                                    ) : (
                                        <View style={styles.donorAvatarPlaceholder}>
                                            <Ionicons name="person" size={24} color="#666" />
                                        </View>
                                    )}
                                    <View style={styles.donorDetails}>
                                        <Text style={styles.donorName}>
                                            {`${donor.user?.first_name || ''} ${donor.user?.last_name || ''}`.trim() || 'Anonymous Donor'}
                                        </Text>
                                        {donor.user?.phone && (
                                            <Text style={styles.donorPhone}>{donor.user.phone}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.donorActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleCall(donor.user?.phone)}
                                    >
                                        <Ionicons name="call" size={20} color="#2E7D32" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleMessage(donor.user?.phone)}
                                    >
                                        <Ionicons name="chatbubble" size={20} color="#1976D2" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleViewProfile(donor.id)}
                                    >
                                        <Ionicons name="person-circle" size={20} color="#7C4DFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* No Donors Message */}
                {donors.length === 0 && (
                    <View style={styles.noDonorsContainer}>
                        <Ionicons name="people-outline" size={48} color="#CCC" />
                        <Text style={styles.noDonorsText}>No donors accepted yet</Text>
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
    requestText: {
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
    quantityText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
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
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#D32F2F',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 8,
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
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
    donorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    donorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    donorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    donorAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    donorDetails: {
        flex: 1,
    },
    donorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    donorPhone: {
        fontSize: 14,
        color: '#666',
    },
    donorActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    noDonorsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noDonorsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});
