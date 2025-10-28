import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "@/config/config";

interface PlaceSuggestion {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

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

const DEFAULT_DELTA = 0.0125;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LocationPicker({
    onLocationSelect,
    initialLocation,
    defaultHeight = 320,
}: LocationPickerProps) {
    const safeAreaInsets = useSafeAreaInsets();
    const mapRef = useRef<MapView | null>(null);
    const lastLocationRef = useRef<string | null>(null);
    const isInitialMount = useRef(true);
    const hasSetInitialLocation = useRef(false);
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(initialLocation ?? null);
    const [region, setRegion] = useState<Region>(
        initialLocation
            ? {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: DEFAULT_DELTA,
                longitudeDelta: DEFAULT_DELTA,
            }
            : {
                latitude: 23.8103,
                longitude: 90.4125,
                latitudeDelta: 0.35,
                longitudeDelta: 0.35,
            }
    );
    const [isExpanded, setIsExpanded] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
    const [isFetchingInitialLocation, setIsFetchingInitialLocation] = useState(!initialLocation);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerHeight = isExpanded
        ? Dimensions.get("window").height - safeAreaInsets.top - safeAreaInsets.bottom
        : defaultHeight;

    const googleMapsApiKey = config.GOOGLE_MAPS_API_KEY?.trim() || "";

    // Fetch autocomplete suggestions from Google Places API
    const fetchPlaceSuggestions = useCallback(async (input: string) => {
        if (!input.trim() || !googleMapsApiKey) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    input
                )}&components=country:bd&key=${googleMapsApiKey}`
            );
            const data = await response.json();

            if (data.predictions) {
                const formattedSuggestions: PlaceSuggestion[] = data.predictions.map((pred: any) => ({
                    placeId: pred.place_id,
                    description: pred.description,
                    mainText: pred.structured_formatting?.main_text || pred.description,
                    secondaryText: pred.structured_formatting?.secondary_text || "",
                }));
                setSuggestions(formattedSuggestions);
            }
        } catch (error) {
            console.warn("Error fetching place suggestions", error);
        } finally {
            setIsSearching(false);
        }
    }, [googleMapsApiKey]);

    // Fetch place details from Google Places API
    const fetchPlaceDetails = useCallback(async (placeId: string) => {
        if (!googleMapsApiKey) return;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${googleMapsApiKey}`
            );
            const data = await response.json();

            if (data.result) {
                const { geometry, name, formatted_address } = data.result;
                const latitude = geometry.location.lat;
                const longitude = geometry.location.lng;

                console.log("Selected place from autocomplete:", { name, latitude, longitude });

                const location: SelectedLocation = {
                    name: name || "Selected place",
                    latitude,
                    longitude,
                    address: formatted_address,
                };

                const nextRegion: Region = {
                    latitude,
                    longitude,
                    latitudeDelta: DEFAULT_DELTA,
                    longitudeDelta: DEFAULT_DELTA,
                };

                // Update both location and region
                setSelectedLocation(location);
                setRegion(nextRegion);

                // Animate map to the new location
                setTimeout(() => {
                    mapRef.current?.animateToRegion(nextRegion, 800);
                }, 100);

                // Update lastLocationRef to prevent immediate duplicate from applyLocationUpdate
                const locationKey = `${latitude.toFixed(7)},${longitude.toFixed(7)}`;
                lastLocationRef.current = locationKey;
                console.log("Updated lastLocationRef to:", locationKey);

                // Call parent callback
                onLocationSelect(location);

                // Clear search
                setSearchQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.warn("Error fetching place details", error);
        }
    }, [googleMapsApiKey, onLocationSelect]);

    // Handle search input change with debounce
    const handleSearchChange = useCallback((text: string) => {
        setSearchQuery(text);
        setShowSuggestions(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (text.trim().length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                fetchPlaceSuggestions(text);
            }, 300);
        } else {
            setSuggestions([]);
        }
    }, [fetchPlaceSuggestions]);

    // Handle suggestion selection
    const handleSuggestionPress = useCallback((suggestion: PlaceSuggestion) => {
        fetchPlaceDetails(suggestion.placeId);
    }, [fetchPlaceDetails]);

    // Reverse geocode coordinates so dropping a pin yields a readable label.
    const resolvePlaceName = useCallback(async (latitude: number, longitude: number) => {
        try {
            const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (!result) {
                return { name: "Dropped Pin", address: undefined };
            }

            const nameCandidate = result.name || result.street || result.city || "Dropped Pin";
            const addressParts = [
                result.name,
                result.street,
                result.subregion,
                result.city,
                result.region,
                result.postalCode,
                result.country,
            ].filter(Boolean);

            return {
                name: nameCandidate,
                address: addressParts.join(", "),
            };
        } catch (error) {
            console.warn("Failed to reverse geocode", error);
            return { name: "Dropped Pin", address: undefined };
        }
    }, []);

    const applyLocationUpdate = useCallback(
        async (
            coords: { latitude: number; longitude: number },
            explicitName?: string,
            shouldAnimate?: boolean,
        ) => {
            // Prevent duplicate calls for the EXACT same location (within 1 meter)
            const locationKey = `${coords.latitude.toFixed(7)},${coords.longitude.toFixed(7)}`;
            if (lastLocationRef.current === locationKey) {
                console.log("Skipping duplicate location update for:", locationKey);
                return;
            }

            // Update ref before async operations to prevent race conditions
            const previousLocationKey = lastLocationRef.current;
            lastLocationRef.current = locationKey;

            setIsResolvingAddress(!explicitName);

            const { name, address } = explicitName
                ? { name: explicitName, address: undefined }
                : await resolvePlaceName(coords.latitude, coords.longitude);

            setIsResolvingAddress(false);

            const location: SelectedLocation = {
                name,
                latitude: coords.latitude,
                longitude: coords.longitude,
                address,
            };

            const nextRegion: Region = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: DEFAULT_DELTA,
                longitudeDelta: DEFAULT_DELTA,
            };

            console.log("Updating location from", previousLocationKey, "to", locationKey);
            setSelectedLocation(location);
            setRegion(nextRegion);

            onLocationSelect(location);
        },
        [onLocationSelect, resolvePlaceName],
    );

    useEffect(() => {
        if (!initialLocation) {
            return;
        }

        setSelectedLocation(initialLocation);
        setRegion({
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
            latitudeDelta: DEFAULT_DELTA,
            longitudeDelta: DEFAULT_DELTA,
        });
    }, [initialLocation]);

    useEffect(() => {
        // Mark that initial mount is complete after a brief delay
        const timer = setTimeout(() => {
            isInitialMount.current = false;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only run once on mount, not on every re-render
        if (hasSetInitialLocation.current) {
            return;
        }

        let isMounted = true;

        const requestLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                const permissionGranted = status === Location.PermissionStatus.GRANTED;
                if (!isMounted) {
                    return;
                }
                setHasLocationPermission(permissionGranted);

                if (!permissionGranted || initialLocation) {
                    hasSetInitialLocation.current = true;
                    setIsFetchingInitialLocation(false);
                    return;
                }

                const currentPosition = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (!isMounted) {
                    return;
                }

                const coords = {
                    latitude: currentPosition.coords.latitude,
                    longitude: currentPosition.coords.longitude,
                };

                // Reverse geocode to get a valid address
                const { name, address } = await resolvePlaceName(coords.latitude, coords.longitude);

                const location: SelectedLocation = {
                    name,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    address,
                };

                const nextRegion: Region = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: DEFAULT_DELTA,
                    longitudeDelta: DEFAULT_DELTA,
                };

                const locationKey = `${coords.latitude.toFixed(7)},${coords.longitude.toFixed(7)}`;
                lastLocationRef.current = locationKey;

                console.log("Setting initial location:", locationKey, "with address:", address);
                setSelectedLocation(location);
                setRegion(nextRegion);
                onLocationSelect(location);

                hasSetInitialLocation.current = true;
            } catch (error) {
                console.warn("Location permission error", error);
            } finally {
                if (isMounted) {
                    setIsFetchingInitialLocation(false);
                }
            }
        };

        requestLocation();

        return () => {
            isMounted = false;
        };
    }, [initialLocation, onLocationSelect]);

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [isExpanded, containerHeight]);

    const handleMapPress = useCallback(
        (event: MapPressEvent) => {
            const { coordinate } = event.nativeEvent;
            applyLocationUpdate(coordinate);
        },
        [applyLocationUpdate],
    );

    const toggleExpanded = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const renderSearchBar = () => {
        if (!googleMapsApiKey) {
            return (
                <View style={styles.searchFallback}>
                    <Ionicons name="warning" size={18} color="#c17" style={styles.searchFallbackIcon} />
                    <Text style={styles.searchFallbackText}>Add a Google Maps API key to enable search</Text>
                </View>
            );
        }

        return (
            <View style={styles.searchWrapper}>
                <View style={styles.textInputWrapper}>
                    <Ionicons name="search" size={20} color="#9ea0a6" style={styles.searchIcon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search for a place..."
                        placeholderTextColor="#9ea0a6"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery("");
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={20} color="#9ea0a6" />
                        </TouchableOpacity>
                    )}
                    {isSearching && (
                        <ActivityIndicator size="small" color="#4285F4" style={styles.searchingIndicator} />
                    )}
                </View>

                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsList}>
                        <FlatList
                            data={suggestions}
                            keyExtractor={(item) => item.placeId}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.suggestionItem}
                                    onPress={() => handleSuggestionPress(item)}
                                >
                                    <Ionicons name="location-outline" size={20} color="#666" style={styles.suggestionIcon} />
                                    <View style={styles.suggestionTextContainer}>
                                        <Text style={styles.suggestionTextMain}>{item.mainText}</Text>
                                        {item.secondaryText && (
                                            <Text style={styles.suggestionTextSecondary}>{item.secondaryText}</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        />
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[
            styles.container,
            { height: containerHeight },
            isExpanded && styles.containerExpanded
        ]}>
            <View style={[styles.searchContainer, isExpanded && styles.searchContainerExpanded]}>
                {renderSearchBar()}
            </View>

            <View style={styles.mapWrapper}>
                {isFetchingInitialLocation && !selectedLocation ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#c2175b" />
                        <Text style={styles.loadingText}>Fetching your location…</Text>
                    </View>
                ) : (
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFill}
                        initialRegion={region}
                        region={region}
                        onPress={handleMapPress}
                        showsUserLocation={hasLocationPermission}
                        showsMyLocationButton={false}
                        pitchEnabled
                        rotateEnabled
                        onRegionChangeComplete={(newRegion) => {
                            // Only update region state if user is panning/zooming
                            // Don't update if it's from our controlled region prop
                            if (!isInitialMount.current) {
                                setRegion(newRegion);
                            }
                        }}
                    >
                        {selectedLocation && (
                            <Marker
                                key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
                                coordinate={{
                                    latitude: selectedLocation.latitude,
                                    longitude: selectedLocation.longitude,
                                }}
                                draggable
                                onDragEnd={(event) => applyLocationUpdate(event.nativeEvent.coordinate)}
                                title={selectedLocation.name}
                                description={selectedLocation.address}
                            />
                        )}
                    </MapView>
                )}

                <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded} activeOpacity={0.8}>
                    <Ionicons name={isExpanded ? "contract" : "expand"} size={20} color="#fff" />
                </TouchableOpacity>

                {isResolvingAddress && (
                    <View style={styles.resolvingOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.resolvingText}>Looking up address…</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    containerExpanded: {
        borderRadius: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    searchContainer: {
        padding: 12,
        zIndex: 2,
    },
    searchContainerExpanded: {
        padding: 0,
        paddingTop: 12,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    searchWrapper: {
        position: "relative",
        zIndex: 1000,
    },
    searchFallback: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#f9dede",
        borderRadius: 12,
    },
    searchFallbackIcon: {
        marginRight: 8,
    },
    searchFallbackText: {
        color: "#a11",
        fontSize: 13,
        flex: 1,
    },
    textInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: "#222",
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
    searchingIndicator: {
        marginLeft: 8,
    },
    suggestionsList: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 250,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ececec",
    },
    suggestionIcon: {
        marginRight: 12,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionTextMain: {
        color: "#222",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    suggestionTextSecondary: {
        color: "#666",
        fontSize: 13,
        lineHeight: 18,
    },
    mapWrapper: {
        flex: 1,
        minHeight: 220,
        position: "relative",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 12,
        color: "#666",
        fontSize: 15,
    },
    expandButton: {
        position: "absolute",
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(16,16,16,0.75)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3,
    },
    resolvingOverlay: {
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "rgba(0,0,0,0.7)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    resolvingText: {
        color: "#fff",
        fontSize: 13,
        marginLeft: 8,
    },
});
