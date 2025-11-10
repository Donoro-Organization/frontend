import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAppointments from './user-appointments/UserAppointments';
import DonorAppointments from './donor-appointments/DonorAppointments';

type AppointmentType = 'user' | 'donor';

export default function Appointments() {
    const [appointmentType, setAppointmentType] = useState<AppointmentType>('user');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Appointments</Text>
                
                {/* Toggle Button */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            appointmentType === 'user' && styles.toggleButtonActive
                        ]}
                        onPress={() => setAppointmentType('user')}
                    >
                        <Ionicons
                            name="document-text"
                            size={16}
                            color={appointmentType === 'user' ? '#fff' : '#666'}
                            style={styles.toggleIcon}
                        />
                        <Text
                            style={[
                                styles.toggleButtonText,
                                appointmentType === 'user' && styles.toggleButtonTextActive
                            ]}
                        >
                            Requests
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            appointmentType === 'donor' && styles.toggleButtonActive
                        ]}
                        onPress={() => setAppointmentType('donor')}
                    >
                        <Ionicons
                            name="mail"
                            size={16}
                            color={appointmentType === 'donor' ? '#fff' : '#666'}
                            style={styles.toggleIcon}
                        />
                        <Text
                            style={[
                                styles.toggleButtonText,
                                appointmentType === 'donor' && styles.toggleButtonTextActive
                            ]}
                        >
                            Invitations
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {appointmentType === 'user' ? (
                <UserAppointments />
            ) : (
                <DonorAppointments />
            )}
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
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        padding: 4,
        width: '100%',
        maxWidth: 400,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleIcon: {
        marginRight: 4,
    },
    toggleButtonActive: {
        backgroundColor: '#D32F2F',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    toggleButtonTextActive: {
        color: '#fff',
    },
});

