import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BloodGroup } from '@/types/bloodRequest';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import DetailsButton from './DetailsButton';

interface CompletedRequestCardProps {
    request: any;
    onViewDetails: (requestId: string) => void;
}

export default function CompletedRequestCard({
    request,
    onViewDetails,
}: CompletedRequestCardProps) {
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

    const donorCount = request.donors?.length || 0;

    return (
        <View style={styles.card}>
            {/* Top Section: Date + Content */}
            <View style={styles.topSection}>
                {/* Left: Date Badge */}
                <View style={styles.dateSection}>
                    <Text style={styles.dateDay}>{getDay(request.required_datetime)}</Text>
                    <Text style={styles.dateMonth}>{getMonth(request.required_datetime)}</Text>
                </View>

                {/* Right: Content Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.hospitalName} numberOfLines={1}>
                        {request.location}
                    </Text>
                    <Text style={styles.condition} numberOfLines={1}>
                        {request.patient_condition || 'Blood needed'}
                    </Text>

                    {/* Blood Type and Time Row */}
                    <View style={styles.infoRow}>
                        <View style={styles.bloodBadge}>
                            <Text style={styles.bloodText}>{request.blood_group}</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.timeText}>{getTime(request.required_datetime)}</Text>
                        </View>
                    </View>

                    {/* Donor Count */}
                    <View style={styles.donorCountContainer}>
                        <Ionicons name="people" size={16} color="#1976D2" />
                        <Text style={styles.donorCountText}>
                            {donorCount} {donorCount === 1 ? 'donor' : 'donors'} donated
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section: Action Button */}
            <View style={styles.bottomSection}>
                <DetailsButton
                    onPress={() => onViewDetails(request.id)}
                    color="#1976D2"
                />
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
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        marginRight: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    dateDay: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1976D2',
        lineHeight: 40,
    },
    dateMonth: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1976D2',
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
        marginBottom: 8,
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
    donorCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    donorCountText: {
        fontSize: 13,
        color: '#1976D2',
        fontWeight: '600',
    },
});
