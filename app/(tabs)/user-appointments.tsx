import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserAppointments from '@/components/user-appointments/UserAppointments';


export default function UserAppointmentsScreen() {
    return (
        <View style={styles.container}>
            <UserAppointments />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
