import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectedLocation {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
}

interface LocationPickerProps {
    onLocationSelect: (location: SelectedLocation) => void;
    initialLocation?: SelectedLocation;
    defaultHeight?: number;
}

export default function LocationPicker({
    onLocationSelect,
    initialLocation,
    defaultHeight = 300,
}: LocationPickerProps) {
    return (
        <View style={[styles.container, { height: defaultHeight }]}>
            <View style={styles.webFallback}>
                <Ionicons name="map" size={48} color="#ccc" />
                <Text style={styles.webFallbackText}>
                    Map is only available on mobile devices
                </Text>
                <Text style={styles.webFallbackSubtext}>
                    Please use the mobile app to access the location picker
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    webFallback: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 32,
    },
    webFallbackText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    webFallbackSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
