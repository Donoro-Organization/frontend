import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { BloodGroup } from "@/types/bloodRequest";

interface BloodGroupPickerProps {
    value: BloodGroup | "";
    onChange: (bloodGroup: BloodGroup) => void;
    error?: string;
}

const BLOOD_GROUPS: BloodGroup[] = [
    BloodGroup.A_POSITIVE,
    BloodGroup.A_NEGATIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.B_NEGATIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.AB_NEGATIVE,
    BloodGroup.O_POSITIVE,
    BloodGroup.O_NEGATIVE,
];

export default function BloodGroupPicker({
    value,
    onChange,
    error,
}: BloodGroupPickerProps) {
    return (
        <View>
            <View style={styles.bloodGroupContainer}>
                {BLOOD_GROUPS.map((group) => (
                    <TouchableOpacity
                        key={group}
                        style={[
                            styles.bloodGroupButton,
                            value === group && styles.bloodGroupButtonActive,
                        ]}
                        onPress={() => onChange(group)}
                    >
                        <Text
                            style={[
                                styles.bloodGroupButtonText,
                                value === group && styles.bloodGroupButtonTextActive,
                            ]}
                        >
                            {group}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {error ? (
                <Text variant="bodySmall" style={styles.errorText}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    bloodGroupContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
    },
    bloodGroupButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#C84B4B",
        minWidth: 70,
        alignItems: "center",
    },
    bloodGroupButtonActive: {
        backgroundColor: "#C84B4B",
        borderColor: "#C84B4B",
    },
    bloodGroupButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#C84B4B",
    },
    bloodGroupButtonTextActive: {
        color: "#fff",
    },
    errorText: {
        color: "#ff0000",
        marginTop: 8,
    },
});
