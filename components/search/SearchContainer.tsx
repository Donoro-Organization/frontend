import React, { useState, useCallback, useMemo } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Appbar,
    Text,
    ActivityIndicator,
    Button,
    Surface,
    IconButton,
    Searchbar,
} from "react-native-paper";
import SearchQuery from "./SearchQuery";
import DonorListItem from "./DonorListItem";
import BloodRequestForm from "./BloodRequestForm";
import { SearchFormData, DonorSearchResult } from "@/types/search";
import { apiCall } from "@/hooks/useAPI";
import { Ionicons } from "@expo/vector-icons";

interface SearchContainerProps {
    onClose?: () => void;
}

export default function SearchContainer({ onClose }: SearchContainerProps) {
    const [showSearchQuery, setShowSearchQuery] = useState(true);
    const [showBloodRequestForm, setShowBloodRequestForm] = useState(false);
    const [donors, setDonors] = useState<DonorSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchFormData | null>(null);
    const [currentRange, setCurrentRange] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDonorIds, setSelectedDonorIds] = useState<Set<string>>(new Set());

    const toggleDonorSelection = useCallback((donorId: string) => {
        setSelectedDonorIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(donorId)) {
                newSet.delete(donorId);
            } else {
                newSet.add(donorId);
            }
            return newSet;
        });
    }, []);

    const performSearch = async (
        formData: SearchFormData,
        range: number,
        page: number,
        append: boolean = false
    ) => {
        if (!formData.location || !formData.bloodGroup) return;

        if (append) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            const requiredDatetime = formData.requiredDate.toISOString();

            const queryParams = new URLSearchParams({
                blood_group: formData.bloodGroup,
                latitude: formData.location.latitude.toString(),
                longitude: formData.location.longitude.toString(),
                required_datetime: requiredDatetime,
                page: page.toString(),
                limit: "10",
                range: range.toString(),
            });

            const response = await apiCall<DonorSearchResult[]>(
                `/donors/search?${queryParams.toString()}`,
                {
                    method: "GET",
                    requiresAuth: true,
                }
            );

            const results = Array.isArray(response) ? response : [];

            if (append) {
                setDonors((prev) => {
                    const existingIds = new Set(prev.map(d => d.donor.id));
                    const newDonors = results.filter(r => !existingIds.has(r.donor.id));
                    return [...prev, ...newDonors];
                });
            } else {
                setDonors(results);
            }

            // Check if we got results equal to limit (meaning there might be more)
            setHasMore(results.length === 10);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to search donors";
            setError(errorMessage);
            console.error("Search error:", err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
            setRefreshing(false);
        }
    };

    const handleSearch = async (formData: SearchFormData) => {
        setSearchParams(formData);
        setCurrentRange(15);
        setCurrentPage(1);
        setHasMore(false);
        await performSearch(formData, 15, 1, false);
        setShowSearchQuery(false);
    };

    const handleSearchAgain = async () => {
        if (!searchParams) return;
        const newRange = currentRange + 15;

        // Check if new range exceeds 200km
        if (newRange > 200) {
            setError("Maximum search range of 200 km reached. No more donors available in your area.");
            setHasMore(false);
            return;
        }

        setCurrentRange(newRange);
        setCurrentPage(1); // Reset to page 1 when expanding range
        await performSearch(searchParams, newRange, 1, true);
    };

    const handleLoadMore = async () => {
        if (!searchParams || !hasMore || isLoadingMore) return;
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        await performSearch(searchParams, currentRange, nextPage, true);
    };

    const handleClear = () => {
        setDonors([]);
        setError(null);
        setSearchParams(null);
        setCurrentRange(15);
        setCurrentPage(1);
        setHasMore(false);
    };

    const handleRefresh = async () => {
        if (!searchParams) return;
        setRefreshing(true);
        setCurrentRange(15);
        setCurrentPage(1);
        await performSearch(searchParams, 15, 1, false);
    };

    const handleBackToSearch = () => {
        setShowSearchQuery(true);
    };

    // Filter donors based on search query
    const filteredDonors = useMemo(() => {
        if (!searchQuery.trim()) return donors;

        const query = searchQuery.toLowerCase();
        return donors.filter((item) => {
            const fullName =
                `${item.donor.user.first_name} ${item.donor.user.last_name}`.toLowerCase();
            return fullName.includes(query);
        });
    }, [donors, searchQuery]);

    const selectedDonors = useMemo(() => {
        return donors.filter((donor) => selectedDonorIds.has(donor.donor.id));
    }, [donors, selectedDonorIds]);

    if (showSearchQuery) {
        return (
            <SearchQuery
                onSearch={handleSearch}
                onClear={handleClear}
                onClose={onClose}
                loading={loading}
            />
        );
    }

    if (showBloodRequestForm && searchParams) {
        return (
            <BloodRequestForm
                selectedDonors={selectedDonors}
                searchFormData={searchParams}
                onBack={() => setShowBloodRequestForm(false)}
            />
        );
    }

    const renderHeader = () => (
        <View>
            <Appbar.Header style={styles.appbarHeader}>
                <Appbar.BackAction onPress={handleBackToSearch} />
                <Appbar.Content
                    title={`${donors.length} Donor${donors.length !== 1 ? "s" : ""} Found`}
                />
                <Appbar.Action
                    icon="tune"
                    onPress={handleBackToSearch}
                    iconColor="#C84B4B"
                />
            </Appbar.Header>
            {donors.length > 0 && (
                <>
                    <Searchbar
                        placeholder="Search by name"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        iconColor="#C84B4B"
                        inputStyle={styles.searchBarInput}
                    />
                    <View style={styles.instructionContainer}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="information-circle-outline" size={16} color="#666" />
                            <Text variant="bodySmall" style={styles.instructionText}>
                                Select donors to request by checking the box.
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Ionicons name="information-circle-outline" size={16} color="#666" />
                            <Text variant="bodySmall" style={styles.instructionText}>
                                Click the card to view donor profile.
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <Surface style={styles.loadingMore} elevation={0}>
                    <ActivityIndicator color="#C84B4B" />
                    <Text variant="bodyMedium" style={styles.loadingMoreText}>
                        Loading more donors...
                    </Text>
                </Surface>
            );
        }

        if (hasMore) {
            return (
                <View style={styles.footerContainer}>
                    <Text variant="bodySmall" style={styles.pageInfo}>
                        Page {currentPage} • Showing {donors.length} donors
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={handleLoadMore}
                        style={styles.loadMoreButton}
                        contentStyle={styles.loadMoreButtonContent}
                        labelStyle={styles.loadMoreText}
                        icon="chevron-down"
                    >
                        Load More
                    </Button>
                </View>
            );
        }

        if (donors.length > 0 && currentRange < 200) {
            return (
                <View style={styles.footerContainer}>
                    <Text variant="bodySmall" style={styles.pageInfo}>
                        Page {currentPage} • Showing all {donors.length} donors within {currentRange} km
                    </Text>
                    <Button
                        mode="outlined"
                        onPress={handleSearchAgain}
                        style={styles.searchAgainButton}
                        contentStyle={styles.searchAgainButtonContent}
                        labelStyle={styles.searchAgainText}
                        icon="magnify"
                    >
                        Search again with range {currentRange + 15} km
                    </Button>
                </View>
            );
        }

        if (donors.length > 0) {
            return (
                <View style={styles.footerContainer}>
                    <Text variant="bodySmall" style={styles.pageInfo}>
                        Page {currentPage} • Showing all {donors.length} donors
                    </Text>
                </View>
            );
        }

        return null;
    };

    const renderEmptyState = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                    No Donors Found
                </Text>
                <Text variant="bodyLarge" style={styles.emptyText}>
                    Try adjusting your search criteria or increase the search range
                </Text>
                <Button
                    mode="contained"
                    onPress={handleBackToSearch}
                    style={styles.emptyButton}
                    buttonColor="#C84B4B"
                >
                    Modify Search
                </Button>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {error && (
                <Surface style={styles.errorContainer} elevation={1}>
                    <Text variant="bodyMedium" style={styles.errorText}>
                        {error}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => searchParams && handleSearch(searchParams)}
                        style={styles.retryButton}
                        buttonColor="#C84B4B"
                        compact
                    >
                        Retry
                    </Button>
                </Surface>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#C84B4B" />
                    <Text variant="bodyLarge" style={styles.loadingText}>
                        Searching for donors within {currentRange} km...
                    </Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={filteredDonors}
                        keyExtractor={(item) => item.donor.id}
                        renderItem={({ item }) => (
                            <DonorListItem
                                donor={item}
                                isSelected={selectedDonorIds.has(item.donor.id)}
                                onToggleSelect={toggleDonorSelection}
                            />
                        )}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmptyState}
                        ListFooterComponent={renderFooter}
                        contentContainerStyle={
                            filteredDonors.length === 0 ? styles.emptyListContent : undefined
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={["#C84B4B"]}
                                tintColor="#C84B4B"
                            />
                        }
                    />

                    {selectedDonorIds.size > 0 && (
                        <View style={styles.bottomButtonContainer}>
                            <Button
                                mode="contained"
                                onPress={() => setShowBloodRequestForm(true)}
                                style={styles.sendRequestButton}
                                buttonColor="#C84B4B"
                                icon="send"
                                contentStyle={styles.sendRequestButtonContent}
                            >
                                Send Request to {selectedDonorIds.size} Donor{selectedDonorIds.size !== 1 ? "s" : ""}
                            </Button>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
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
    searchBar: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "#F5F5F5",
        elevation: 0,
    },
    searchBarInput: {
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: "#666",
        textAlign: "center",
    },
    errorContainer: {
        backgroundColor: "#FFEBEE",
        padding: 16,
        margin: 16,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    errorText: {
        color: "#C62828",
        flex: 1,
    },
    retryButton: {
        marginLeft: 12,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyTitle: {
        fontWeight: "600",
        color: "#000",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    emptyButton: {
        borderRadius: 8,
    },
    loadingMore: {
        padding: 20,
        alignItems: "center",
        gap: 8,
    },
    loadingMoreText: {
        color: "#666",
    },
    footerContainer: {
        padding: 16,
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff",
    },
    pageInfo: {
        color: "#666",
        textAlign: "center",
        fontStyle: "italic",
    },
    loadMoreButton: {
        backgroundColor: "#FFEBEE",
        borderColor: "#C84B4B",
        borderRadius: 8,
        width: "100%",
    },
    loadMoreButtonContent: {
        flexDirection: "row-reverse",
    },
    loadMoreText: {
        color: "#C84B4B",
    },
    searchAgainButton: {
        marginTop: 8,
        backgroundColor: "#FFF5F5",
        borderColor: "#C84B4B",
        borderRadius: 8,
        width: "100%",
    },
    searchAgainButtonContent: {
        flexDirection: "row-reverse",
    },
    searchAgainText: {
        color: "#C84B4B",
    },
    instructionContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#FFFFFF",
    },
    instructionText: {
        color: "#666",
        fontStyle: "italic",
    },
    bottomButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    sendRequestButton: {
        borderRadius: 8,
    },
    sendRequestButtonContent: {
        paddingVertical: 8,
    },
});
