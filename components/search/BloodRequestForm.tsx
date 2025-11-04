import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TextInput as RNTextInput,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Appbar,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    Surface,
    Avatar,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DonorSearchResult, SearchFormData } from "@/types/search";
import {
    BloodRequestCreateRequest,
    BulkDonorInvitationItemRequest,
    BulkDonorInvitationCreateRequest,
    BloodGroup
} from "@/types/bloodRequest";
import { apiCall } from "@/hooks/useAPI";
import ErrorDialog from "../ErrorDialog";
import SuccessDialog from "../SuccessDialog";
import { formatDateTime12Hour } from "@/utils/time";
import { PATIENT_CONDITION_SUGGESTIONS, DONOR_NOTE_SUGGESTIONS } from "@/utils/requestSuggestions";

interface BloodRequestFormProps {
    selectedDonors: DonorSearchResult[];
    searchFormData: SearchFormData;
    onBack: () => void;
}

interface DonorNote {
    donorId: string;
    note: string;
}

export default function BloodRequestForm({
    selectedDonors,
    searchFormData,
    onBack,
}: BloodRequestFormProps) {
    const router = useRouter();
    const [patientCondition, setPatientCondition] = useState("");
    const [donorNotes, setDonorNotes] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConditionSuggestions, setShowConditionSuggestions] = useState(false);
    const [expandedNoteSuggestions, setExpandedNoteSuggestions] = useState<Set<string>>(new Set());
    const [focusedDonorId, setFocusedDonorId] = useState<string | null>(null);

    const handleNoteChange = (donorId: string, note: string) => {
        setDonorNotes((prev) => {
            const newMap = new Map(prev);
            newMap.set(donorId, note);
            return newMap;
        });
    };

    const toggleNoteSuggestions = (donorId: string) => {
        setExpandedNoteSuggestions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(donorId)) {
                newSet.delete(donorId);
            } else {
                newSet.add(donorId);
            }
            return newSet;
        });
    };

    const handleConditionSuggestionSelect = (suggestion: string) => {
        setPatientCondition(suggestion);
        setShowConditionSuggestions(false);
    };

    const handleNoteSuggestionSelect = (donorId: string, suggestion: string) => {
        handleNoteChange(donorId, suggestion);
        setExpandedNoteSuggestions((prev) => {
            const newSet = new Set(prev);
            newSet.delete(donorId);
            return newSet;
        });
    };

    const handleApplyNoteToAll = () => {
        if (focusedDonorId) {
            const noteToApply = donorNotes.get(focusedDonorId) || "";
            if (noteToApply.trim()) {
                const newMap = new Map<string, string>();
                selectedDonors.forEach((donor) => {
                    newMap.set(donor.donor.id, noteToApply);
                });
                setDonorNotes(newMap);
            }
        }
    };

    const handleSubmit = async () => {
        if (!searchFormData.location) {
            setErrorMessage("Location is required");
            setShowError(true);
            return;
        }

        if (!searchFormData.bloodGroup) {
            setErrorMessage("Blood group is required");
            setShowError(true);
            return;
        }

        setLoading(true);
        try {
            // Use first suggestion as default if user didn't fill
            const finalPatientCondition = patientCondition.trim() || PATIENT_CONDITION_SUGGESTIONS[0];
            const finalDonorNote = DONOR_NOTE_SUGGESTIONS[0];

            // Prepare blood request data with proper typing
            const bloodRequest: BloodRequestCreateRequest = {
                blood_group: searchFormData.bloodGroup as BloodGroup,
                patient_condition: finalPatientCondition,
                location: searchFormData.location.address || searchFormData.location.name,
                latitude: searchFormData.location.latitude.toString(),
                longitude: searchFormData.location.longitude.toString(),
                required_datetime: searchFormData.requiredDate.toISOString(),
                quantity: searchFormData.bloodBagRequired,
            };

            // Prepare donor invitations with proper typing
            const donorInvitations: BulkDonorInvitationItemRequest[] = selectedDonors.map((donor) => {
                const note = donorNotes.get(donor.donor.id)?.trim() || finalDonorNote;
                return {
                    donor_id: donor.donor.id,
                    notes: note,
                };
            });

            const requestPayload: BulkDonorInvitationCreateRequest = {
                blood_request: bloodRequest,
                donor_invitations: donorInvitations,
            };


            // Call bulk invitation API - Pass object directly, apiCall will stringify it
            const response = await apiCall<any>(
                "/blood-requests/invitations/all",
                {
                    method: "POST",
                    body: requestPayload, // Pass object directly, not stringified
                    requiresAuth: true,
                }
            );

            if (response.status_code === 200 || response.status_code === 201) {
                setSuccessMessage(
                    `Blood request sent to ${selectedDonors.length} donor${selectedDonors.length !== 1 ? "s" : ""
                    } successfully!`
                );
                setShowSuccess(true);

                // Redirect after success
                setTimeout(() => {
                    router.push("/user-appointments");
                }, 2000);
            } else {
                console.error("=== API ERROR RESPONSE ===", response);
                setErrorMessage(response.message || "Failed to send blood request");
                setShowError(true);
            }
        } catch (error) {
            console.error("=== EXCEPTION CAUGHT ===", error);
            setErrorMessage("Failed to send blood request. Please try again.");
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                {/* Header */}
                <Appbar.Header style={styles.appbarHeader}>
                    <Appbar.BackAction onPress={onBack} color="#C84B4B" />
                    <Appbar.Content title="Blood Request Details" titleStyle={styles.headerTitle} />
                </Appbar.Header>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Summary Section */}
                    <Surface style={styles.summarySection} elevation={1}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Request Summary
                        </Text>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium" style={styles.summaryLabel}>
                                Blood Group:
                            </Text>
                            <View style={styles.bloodGroupBadge}>
                                <Text style={styles.bloodGroupBadgeText}>
                                    {searchFormData.bloodGroup}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium" style={styles.summaryLabel}>
                                Quantity:
                            </Text>
                            <Text variant="bodyMedium" style={styles.summaryValue}>
                                {searchFormData.bloodBagRequired} bag{searchFormData.bloodBagRequired !== 1 ? "s" : ""}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium" style={styles.summaryLabel}>
                                Required Date:
                            </Text>
                            <Text variant="bodyMedium" style={styles.summaryValue}>
                                {formatDateTime12Hour(searchFormData.requiredDate)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium" style={styles.summaryLabel}>
                                Location:
                            </Text>
                            <Text variant="bodyMedium" style={styles.summaryValue}>
                                {searchFormData.location?.address || "Not specified"}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text variant="bodyMedium" style={styles.summaryLabel}>
                                Selected Donors:
                            </Text>
                            <Text variant="bodyMedium" style={styles.summaryValueHighlight}>
                                {selectedDonors.length}
                            </Text>
                        </View>
                    </Surface>

                    {/* Patient Condition */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Patient Condition
                        </Text>
                        <Text variant="bodySmall" style={styles.helperText}>
                            Optional: Describe the patient's condition (defaults to suggestion if left empty)
                        </Text>

                        <TextInput
                            mode="outlined"
                            value={patientCondition}
                            onChangeText={setPatientCondition}
                            placeholder="e.g., Emergency surgery, accident victim..."
                            multiline
                            numberOfLines={3}
                            style={styles.textArea}
                            outlineColor="#E0E0E0"
                            activeOutlineColor="#C84B4B"
                            maxLength={500}
                        />
                        <Text variant="bodySmall" style={styles.characterCount}>
                            {patientCondition.length}/500
                        </Text>

                        {/* Suggestions Toggle Button */}
                        <TouchableOpacity
                            onPress={() => setShowConditionSuggestions(!showConditionSuggestions)}
                            style={styles.suggestionToggle}
                        >
                            <Text style={styles.suggestionToggleText}>Show Suggestions</Text>
                            <Ionicons
                                name={showConditionSuggestions ? "chevron-up" : "chevron-down"}
                                size={16}
                                color="#C84B4B"
                            />
                        </TouchableOpacity>

                        {/* Expandable Suggestions List */}
                        {showConditionSuggestions && (
                            <View style={styles.suggestionsContainer}>
                                {PATIENT_CONDITION_SUGGESTIONS.map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleConditionSuggestionSelect(suggestion)}
                                        style={styles.suggestionItem}
                                    >
                                        <Ionicons name="medical" size={16} color="#C84B4B" />
                                        <Text style={styles.suggestionText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Donor Notes */}
                    <View style={styles.section}>
                        <View style={styles.notesHeaderRow}>
                            <View style={styles.notesHeaderLeft}>
                                <Text variant="titleMedium" style={styles.sectionTitle}>
                                    Notes for Donors
                                </Text>
                                <Text variant="bodySmall" style={styles.helperText}>
                                    Optional: Add specific notes for each donor (defaults to suggestion if left empty)
                                </Text>
                            </View>

                            <Button
                                mode="outlined"
                                onPress={handleApplyNoteToAll}
                                icon="content-copy"
                                style={styles.applyToAllButton}
                                textColor="#C84B4B"
                                disabled={!focusedDonorId || !donorNotes.get(focusedDonorId || "")}
                                compact
                            >
                                Apply to All
                            </Button>
                        </View>

                        {selectedDonors.map((donor, index) => {
                            const donorUser = donor.donor.user;
                            const initials = getInitials(donorUser.first_name || "", donorUser.last_name || "");
                            const isExpanded = expandedNoteSuggestions.has(donor.donor.id);

                            return (
                                <View key={donor.donor.id} style={styles.donorNoteContainer}>
                                    <View style={styles.donorHeader}>
                                        {donorUser.profile_image?.url ? (
                                            <Avatar.Image
                                                size={40}
                                                source={{ uri: donorUser.profile_image.url }}
                                            />
                                        ) : (
                                            <Avatar.Text
                                                size={40}
                                                label={initials}
                                                style={styles.avatarBackground}
                                                labelStyle={styles.avatarText}
                                            />
                                        )}
                                        <Text variant="bodyMedium" style={styles.donorName}>
                                            {index + 1}. {donorUser.first_name} {donorUser.last_name}
                                        </Text>
                                    </View>
                                    <TextInput
                                        mode="outlined"
                                        value={donorNotes.get(donor.donor.id) || ""}
                                        onChangeText={(text) => handleNoteChange(donor.donor.id, text)}
                                        onFocus={() => setFocusedDonorId(donor.donor.id)}
                                        placeholder="Add a note for this donor..."
                                        multiline
                                        numberOfLines={2}
                                        style={styles.donorNoteInput}
                                        outlineColor="#E0E0E0"
                                        activeOutlineColor="#C84B4B"
                                        maxLength={500}
                                    />

                                    {/* Individual Suggestions Toggle */}
                                    <TouchableOpacity
                                        onPress={() => toggleNoteSuggestions(donor.donor.id)}
                                        style={styles.suggestionToggle}
                                    >
                                        <Text style={styles.suggestionToggleText}>Show Suggestions</Text>
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color="#C84B4B"
                                        />
                                    </TouchableOpacity>

                                    {/* Expandable Suggestions List for this donor */}
                                    {isExpanded && (
                                        <View style={styles.suggestionsContainer}>
                                            {DONOR_NOTE_SUGGESTIONS.map((suggestion, suggestionIndex) => (
                                                <TouchableOpacity
                                                    key={suggestionIndex}
                                                    onPress={() => handleNoteSuggestionSelect(donor.donor.id, suggestion)}
                                                    style={styles.suggestionItem}
                                                >
                                                    <Ionicons name="chatbox" size={16} color="#C84B4B" />
                                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Submit Button */}
                    <View style={styles.submitSection}>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={loading}
                            buttonColor="#C84B4B"
                            style={styles.submitButton}
                            contentStyle={styles.submitButtonContent}
                        >
                            {loading ? "Sending..." : "Send Blood Request"}
                        </Button>
                    </View>
                </ScrollView>

                {/* Error Dialog */}
                <ErrorDialog
                    visible={showError}
                    message={errorMessage}
                    onClose={() => setShowError(false)}
                />

                {/* Success Dialog */}
                <SuccessDialog
                    visible={showSuccess}
                    message={successMessage}
                    onClose={() => setShowSuccess(false)}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    appbarHeader: {
        backgroundColor: "#C84B4B",
        elevation: 0,
    },
    headerTitle: {
        color: "#fff",
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    summarySection: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 12,
    },
    section: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
    },
    sectionTitle: {
        fontWeight: "600",
        color: "#C84B4B",
        marginBottom: 4,
        fontSize: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    summaryLabel: {
        color: "#666",
        flex: 1,
    },
    summaryValue: {
        color: "#000",
        fontWeight: "500",
        flex: 1,
        textAlign: "right",
    },
    summaryValueHighlight: {
        color: "#C84B4B",
        fontWeight: "700",
        fontSize: 16,
    },
    bloodGroupBadge: {
        backgroundColor: "#FFEBEE",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C84B4B",
    },
    bloodGroupBadgeText: {
        color: "#C84B4B",
        fontWeight: "700",
        fontSize: 14,
    },
    helperText: {
        color: "#666",
        marginBottom: 8,
        fontSize: 13,
    },
    suggestionToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        marginTop: 8,
    },
    suggestionToggleText: {
        color: "#C84B4B",
        fontSize: 14,
        fontWeight: "500",
    },
    suggestionsContainer: {
        backgroundColor: "#FFF5F5",
        borderRadius: 8,
        padding: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#FFE0E0",
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#FFE0E0",
    },
    suggestionText: {
        flex: 1,
        color: "#333",
        fontSize: 13,
        lineHeight: 18,
    },
    textArea: {
        backgroundColor: "#fff",
        marginTop: 4,
        paddingVertical: 8,
    },
    characterCount: {
        color: "#999",
        textAlign: "right",
        marginTop: 4,
        fontSize: 12,
    },
    notesHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 12,
    },
    notesHeaderLeft: {
        flex: 1,
    },
    noteActionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    applyToAllButton: {
        borderColor: "#C84B4B",
    },
    donorNoteContainer: {
        marginBottom: 16,
        backgroundColor: "#FFF5F5",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFE0E0",
    },
    donorHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    avatarBackground: {
        backgroundColor: "#C84B4B",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    donorName: {
        fontWeight: "600",
        color: "#000",
        flex: 1,
    },
    donorNoteInput: {
        backgroundColor: "#fff",
        paddingVertical: 8,
    },
    submitSection: {
        padding: 16,
        paddingBottom: 32,
    },
    submitButton: {
        borderRadius: 8,
        elevation: 2,
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
});
