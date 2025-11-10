import React from 'react';
import { View, StyleSheet } from 'react-native';
import Appointments from '@/components/Appointments';

export default function AppointmentsScreen() {
    return (
        <View style={styles.container}>
            <Appointments />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

