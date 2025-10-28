import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LocationPicker, { SelectedLocation } from '@/components/LocationPicker';

export default function LocationPickerExample() {
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

    const handleLocationSelect = (location: SelectedLocation) => {
        console.log('Selected location:', location);
        setSelectedLocation(location);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Location Picker Example</Text>
                <Text style={styles.subtitle}>
                    Search for a place or drag the marker to select a location
                </Text>

                <View style={styles.mapContainer}>
                    <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        defaultHeight={400}
                    />
                </View>

                {selectedLocation && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Selected Location</Text>

                        {/* First Row: Name and Latitude */}
                        <View style={styles.resultRow}>
                            <View style={styles.leftColumn}>
                                <Text style={styles.resultLabel}>Name:</Text>
                                <Text style={styles.resultValue} numberOfLines={2}>{selectedLocation.name}</Text>
                            </View>
                            <View style={styles.rightColumn}>
                                <Text style={styles.resultLabel}>Latitude:</Text>
                                <Text style={styles.resultValue}>{selectedLocation.latitude.toFixed(6)}</Text>
                            </View>
                        </View>

                        {/* Second Row: Address and Longitude */}
                        <View style={styles.resultRow}>
                            <View style={styles.leftColumn}>
                                <Text style={styles.resultLabel}>Address:</Text>
                                <Text style={styles.resultValue} numberOfLines={2}>
                                    {selectedLocation.address || 'N/A'}
                                </Text>
                            </View>
                            <View style={styles.rightColumn}>
                                <Text style={styles.resultLabel}>Longitude:</Text>
                                <Text style={styles.resultValue}>{selectedLocation.longitude.toFixed(6)}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    },
    mapContainer: {
        marginBottom: 24,
    },
    resultContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    leftColumn: {
        flex: 1,
        marginRight: 12,
    },
    rightColumn: {
        flex: 1,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 15,
        color: '#222',
    },
});
