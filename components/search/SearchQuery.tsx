import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Button, Text, Appbar, Portal, Surface } from "react-native-paper";
import { BloodGroup } from "@/types/bloodRequest";
import { SearchFormData } from "@/types/search";
import LocationPicker, { SelectedLocation } from "../LocationPicker";
import BloodGroupPicker from "../BloodGroupPicker";
import BloodBagSlider from "./BloodBagSlider";
import DateTimeSelector from "./DateTimeSelector";
import ErrorDialog from "../ErrorDialog";

interface SearchQueryProps {
    onSearch: (formData: SearchFormData) => void;
    onClear: () => void;
    onClose?: () => void;
    loading?: boolean;
}

export default function SearchQuery({
    onSearch,
    onClear,
    onClose,
    loading = false,
}: SearchQueryProps) {
    const [formData, setFormData] = useState<SearchFormData>({
        bloodGroup: "",
        location: null,
        bloodBagRequired: 1,
        requiredDate: new Date(),
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [errorDialogVisible, setErrorDialogVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Ref to access DateTimeSelector's validation
    const dateTimeValidationRef = React.useRef<any>(null);

    const handleLocationSelect = (location: SelectedLocation) => {
        setFormData({
            ...formData,
            location: {
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
            },
        });
    }; const validateForm = () => {
        // Check for pending invalid time input
        if (dateTimeValidationRef.current) {
            const timeValidation = dateTimeValidationRef.current();
            if (timeValidation.hasInvalidInput) {
                setErrorMessage(timeValidation.errorMessage);
                setErrorDialogVisible(true);
                return false;
            }
        }

        if (!formData.bloodGroup) {
            setErrorMessage("Please select a blood group");
            setErrorDialogVisible(true);
            return false;
        }

        if (!formData.location) {
            setErrorMessage("Please select a location on the map");
            setErrorDialogVisible(true);
            return false;
        }

        return true;
    };

    const handleSearch = () => {
        if (validateForm()) {
            onSearch(formData);
        }
    };

    const handleClear = () => {
        setFormData({
            bloodGroup: "",
            location: null,
            bloodBagRequired: 1,
            requiredDate: new Date(),
        });
        onClear();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <Appbar.Header style={styles.appbarHeader}>
                {onClose && <Appbar.Action icon="close" onPress={onClose} />}
                <Appbar.Content title="Search Donor" />
            </Appbar.Header>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Blood Group Picker */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Blood Group:
                    </Text>
                    <BloodGroupPicker
                        value={formData.bloodGroup}
                        onChange={(bloodGroup: BloodGroup) => {
                            setFormData({ ...formData, bloodGroup });
                        }}
                    />
                </View>

                {/* Blood Bag Required Slider */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Blood Bag Required
                    </Text>
                    <BloodBagSlider
                        value={formData.bloodBagRequired}
                        onChange={(bloodBagRequired: number) =>
                            setFormData({ ...formData, bloodBagRequired })
                        }
                    />
                </View>

                {/* Date and Time Selector */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Choose Date & Time
                    </Text>
                    <DateTimeSelector
                        selectedDate={formData.requiredDate}
                        onChange={(requiredDate: Date) =>
                            setFormData({ ...formData, requiredDate })
                        }
                        getValidationState={dateTimeValidationRef}
                    />
                </View>

                {/* Location Picker - Integrated */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={styles.label}>
                        Location
                    </Text>
                    <Text variant="bodySmall" style={styles.helperText}>
                        {formData.location
                            ? formData.location.address || formData.location.name
                            : "Select your location on the map"}
                    </Text>
                    <View style={styles.mapContainer}>
                        <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialLocation={
                                formData.location
                                    ? {
                                        name: formData.location.name,
                                        latitude: formData.location.latitude,
                                        longitude: formData.location.longitude,
                                        address: formData.location.address,
                                    }
                                    : undefined
                            }
                            defaultHeight={320}
                        />
                    </View>
                </View>

                {/* Info Message */}
                <Surface style={styles.infoContainer} elevation={0}>
                    <Text variant="bodyMedium" style={styles.infoText}>
                        Shows profiles within a 15-km range initially. When run out of
                        matches, you can try with increased range.
                    </Text>
                </Surface>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="outlined"
                        onPress={handleClear}
                        style={styles.clearButton}
                        labelStyle={styles.clearButtonText}
                        disabled={loading}
                    >
                        Clear all
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleSearch}
                        style={styles.searchButton}
                        labelStyle={styles.searchButtonText}
                        buttonColor="#C84B4B"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </Button>
                </View>
            </ScrollView>

            <ErrorDialog
                visible={errorDialogVisible}
                message={errorMessage}
                onClose={() => setErrorDialogVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    appbarHeader: {
        backgroundColor: "#fff",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 20,
    },
    label: {
        fontWeight: "500",
        color: "#000",
        marginBottom: 8,
    },
    locationButton: {
        borderColor: "#C84B4B",
        borderRadius: 8,
    },
    locationButtonContent: {
        justifyContent: "space-between",
        flexDirection: "row-reverse",
    },
    locationButtonLabel: {
        color: "#000",
    },
    inputError: {
        borderColor: "#ff0000",
    },
    errorText: {
        color: "#ff0000",
        marginTop: 4,
    },
    helperText: {
        color: "#666",
        marginBottom: 8,
    },
    mapContainer: {
        height: 320,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 8,
    },
    infoContainer: {
        backgroundColor: "#F4D0D0",
        borderRadius: 8,
        padding: 16,
        marginTop: 24,
    },
    infoText: {
        color: "#5A3636",
        textAlign: "center",
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 24,
        marginBottom: 32,
    },
    clearButton: {
        flex: 1,
        borderColor: "#C84B4B",
        borderRadius: 8,
    },
    clearButtonText: {
        color: "#C84B4B",
    },
    searchButton: {
        flex: 1,
        borderRadius: 8,
    },
    searchButtonText: {
        color: "#fff",
    },
});
