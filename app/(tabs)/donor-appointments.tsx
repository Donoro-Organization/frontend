// Example integration in your app
// File: app/(tabs)/donor-appointments.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import DonorAppointments from '@/components/donor-appointments/DonorAppointments';

export default function DonorAppointmentsScreen() {
    return (
        <View style={styles.container}>
            <DonorAppointments />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
