import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { Text, Avatar, Chip, Surface } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { DonorSearchResult } from "@/types/search";
import { useRouter } from "expo-router";

interface DonorListItemProps {
    donor: DonorSearchResult;
    isSelected?: boolean;
    onToggleSelect?: (donorId: string) => void;
}

export default function DonorListItem({ donor, isSelected = false, onToggleSelect }: DonorListItemProps) {
    const router = useRouter();
    const { donor: donorData, distance_km, avg_rating } = donor;

    const handlePress = () => {
        // Navigate to donor profile
        router.push(`/profile/${donorData.user_id}` as any);
    };

    const handleCheckboxPress = () => {
        if (onToggleSelect) {
            onToggleSelect(donorData.id);
        }
    };

    const getInitials = () => {
        const firstName = donorData.user.first_name || "";
        const lastName = donorData.user.last_name || "";
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDistance = (distance: number | null) => {
        if (distance === null) return "N/A";
        if (distance < 1) return `${Math.round(distance * 1000)}m`;
        return `${distance.toFixed(1)} km`;
    };

    const formatRating = (rating: number | null) => {
        if (rating === null) return "N/A";
        return rating.toFixed(1);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Surface style={styles.cardSurface} elevation={0}>
                    <View style={styles.leftSection}>
                        {/* Profile Image */}
                        {donorData.user.profile_image?.url ? (
                            <Avatar.Image
                                size={56}
                                source={{ uri: donorData.user.profile_image.url }}
                            />
                        ) : (
                            <Avatar.Text
                                size={56}
                                label={getInitials()}
                                style={styles.avatarBackground}
                                labelStyle={styles.avatarText}
                            />
                        )}

                        {/* Donor Info */}
                        <View style={styles.infoContainer}>
                            <Text variant="titleMedium" style={styles.name} numberOfLines={1}>
                                {donorData.user.first_name} {donorData.user.last_name}
                            </Text>

                            <View style={styles.detailsRow}>
                                {/* Blood Group */}
                                <View style={styles.bloodGroupChip}>
                                    <Text style={styles.bloodGroupText}>
                                        {donorData.blood_group}
                                    </Text>
                                </View>

                                {/* Rating */}
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={14} color="#FFC107" />
                                    <Text variant="bodySmall" style={styles.ratingText}>
                                        {formatRating(avg_rating)}
                                    </Text>
                                </View>

                                {/* Distance */}
                                <View style={styles.distanceContainer}>
                                    <Ionicons name="location" size={14} color="#C84B4B" />
                                    <Text variant="bodySmall" style={styles.distanceText}>
                                        {formatDistance(distance_km)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Checkbox */}
                    <TouchableOpacity
                        onPress={handleCheckboxPress}
                        style={styles.checkboxContainer}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && (
                                <Ionicons name="checkmark" size={18} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>
                </Surface>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
    },
    cardSelected: {
        backgroundColor: "#FFF5F5",
    },
    cardSurface: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
        backgroundColor: "transparent",
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    avatarBackground: {
        backgroundColor: "#C84B4B",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "600",
    },
    infoContainer: {
        flex: 1,
        gap: 6,
    },
    name: {
        fontWeight: "600",
        color: "#000",
    },
    detailsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    bloodGroupChip: {
        backgroundColor: "#FFEBEE",
        borderWidth: 1,
        borderColor: "#C84B4B",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    bloodGroupText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#C84B4B",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: "#666",
        fontWeight: "500",
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    distanceText: {
        color: "#666",
        fontWeight: "500",
    },
    checkboxContainer: {
        padding: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#C84B4B",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    checkboxSelected: {
        backgroundColor: "#C84B4B",
        borderColor: "#C84B4B",
    },
});
