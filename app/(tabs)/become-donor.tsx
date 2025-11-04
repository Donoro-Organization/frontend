import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { User, Gender } from '@/types/user';
import { DonorSignupData } from '@/types/donor';
import { BloodGroup } from '@/types/bloodRequest';
import { apiCall } from '@/hooks/useAPI';
import { getUserId } from '@/utils/storage';
import LocationPicker, { SelectedLocation } from '@/components/LocationPicker';
import BloodGroupPicker from '@/components/BloodGroupPicker';
import ErrorDialog from '@/components/ErrorDialog';
import SuccessDialog from '@/components/SuccessDialog';
import { formatDateToDhaka } from '@/utils/time';


export default function BecomeDonor() {
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showLastDonationPicker, setShowLastDonationPicker] = useState(false);
    const [birthDate, setBirthDate] = useState<Date>(new Date());
    const [lastDonationDate, setLastDonationDate] = useState<Date>(new Date());
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const [formData, setFormData] = useState<DonorSignupData>({
        first_name: '',
        last_name: '',
        phone: '',
        gender: '',
        birth_date: '',
        last_donation_date: '',
        blood_group: '',
        latitude: '',
        longitude: '',
        address: '',
    });

    // Load current user data
    useEffect(() => {
        loadUserData();
    }, []);

    // Set loading when entering page 3 without address
    useEffect(() => {
        if (currentPage === 3 && !formData.address) {
            setIsLoadingLocation(true);
        }
    }, [currentPage, formData.address]);

    const loadUserData = async () => {
        try {
            const userId = await getUserId();
            if (!userId) return;

            // Fetch user data from API using apiCall
            const user: User = await apiCall(`/users/${userId}`, {
                method: 'GET',
                requiresAuth: true,
            });

            setCurrentUser(user);
            // Pre-fill form with existing user data
            const birthDateStr = user.birth_date ? formatDateForInput(user.birth_date) : '';
            setFormData((prev) => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                gender: user.gender || '',
                birth_date: birthDateStr,
                latitude: user.latitude || '',
                longitude: user.longitude || '',
                address: user.address || '',
            }));

            // Set date objects for date pickers
            if (user.birth_date) {
                setBirthDate(new Date(user.birth_date));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setErrorMessage('Failed to load user data. Please try again.');
            setShowError(true);
        }
    };

    const formatDateForInput = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        } catch {
            return '';
        }
    };

    const handleNext = () => {
        if (currentPage === 1) {
            // Validate page 1
            if (!formData.first_name.trim()) {
                setErrorMessage('Please enter your first name');
                setShowError(true);
                return;
            }
            if (!formData.last_name.trim()) {
                setErrorMessage('Please enter your last name');
                setShowError(true);
                return;
            }
            if (!formData.phone.trim()) {
                setErrorMessage('Please enter your phone number');
                setShowError(true);
                return;
            }
            if (!formData.gender) {
                setErrorMessage('Please select your gender');
                setShowError(true);
                return;
            }
            if (!formData.birth_date) {
                setErrorMessage('Please enter your birth date');
                setShowError(true);
                return;
            }
            setCurrentPage(2);
        } else if (currentPage === 2) {
            // Validate page 2
            if (!formData.blood_group) {
                setErrorMessage('Please select your blood group');
                setShowError(true);
                return;
            }
            setCurrentPage(3);
        }
    };

    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else {
            router.back();
        }
    };

    const handleLocationSelect = (location: SelectedLocation) => {
        setIsLoadingLocation(false);
        setFormData((prev) => ({
            ...prev,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            address: location.address || location.name,
        }));
    };

    const handleSubmit = async () => {
        // Validate page 3
        if (!formData.latitude || !formData.longitude) {
            setErrorMessage('Please select your location on the map');
            setShowError(true);
            return;
        }

        setLoading(true);

        try {
            // Prepare the data for API - format dates to ISO string
            const donorData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                gender: formData.gender,
                birth_date: formData.birth_date ? `${formData.birth_date}T00:00:00` : null,
                blood_group: formData.blood_group,
                last_donation_date: formData.last_donation_date ? `${formData.last_donation_date}T00:00:00` : null,
                latitude: formData.latitude,
                longitude: formData.longitude,
                address: formData.address,
            };

            const result = await apiCall('/auth/donor/signup', {
                method: 'POST',
                body: donorData,
                requiresAuth: true,
            });

            if (result.status_code === 201) {
                setSuccessMessage('You have successfully registered as a donor!');
                setShowSuccess(true);
                setTimeout(() => {
                    router.push('/home-page');
                }, 2000);
            } else {
                setErrorMessage(result.message || 'Failed to register as donor');
                setShowError(true);
            }
        } catch (error) {
            console.error('Donor signup error:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    const renderPage1 = () => (
        <ScrollView style={styles.pageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>Personal Information</Text>

            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
                {[
                    { label: '♂ Male', value: Gender.MALE },
                    { label: '♀ Female', value: Gender.FEMALE },
                    { label: 'Other', value: Gender.OTHER },
                ].map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.genderButton,
                            formData.gender === option.value && styles.genderButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, gender: option.value })}
                    >
                        <Text
                            style={[
                                styles.genderButtonText,
                                formData.gender === option.value && styles.genderButtonTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Birth Date</Text>
            {Platform.OS === 'web' ? (
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={formData.birth_date}
                    onChangeText={(text) => setFormData({ ...formData, birth_date: text })}
                    // @ts-ignore - type prop exists on web
                    type="date"
                />
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowBirthDatePicker(true)}
                    >
                        <Text style={styles.datePickerText}>
                            {formData.birth_date || 'Select Birth Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={24} color="#666" />
                    </TouchableOpacity>

                    {showBirthDatePicker && (
                        <DateTimePicker
                            value={birthDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS === 'android') {
                                    setShowBirthDatePicker(false);
                                }
                                if (selectedDate && event.type !== 'dismissed') {
                                    setBirthDate(selectedDate);
                                    setFormData({
                                        ...formData,
                                        birth_date: formatDateToDhaka(selectedDate),
                                    });
                                }
                            }}
                            maximumDate={new Date()}
                        />
                    )}
                </>
            )}
        </ScrollView>
    );

    const renderPage2 = () => (
        <ScrollView style={styles.pageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.pageTitle}>Donor Information</Text>

            <Text style={styles.label}>Select Blood Group</Text>
            <BloodGroupPicker
                value={formData.blood_group as BloodGroup | ""}
                onChange={(bloodGroup: BloodGroup) =>
                    setFormData({ ...formData, blood_group: bloodGroup })
                }
            />

            <Text style={styles.label}>Last Donation Date (Optional)</Text>
            {Platform.OS === 'web' ? (
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={formData.last_donation_date}
                    onChangeText={(text) => setFormData({ ...formData, last_donation_date: text })}
                    // @ts-ignore - type prop exists on web
                    type="date"
                />
            ) : (
                <>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowLastDonationPicker(true)}
                    >
                        <Text style={styles.datePickerText}>
                            {formData.last_donation_date || 'Select Last Donation Date'}
                        </Text>
                        <Ionicons name="calendar-outline" size={24} color="#666" />
                    </TouchableOpacity>

                    {showLastDonationPicker && (
                        <DateTimePicker
                            value={lastDonationDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS === 'android') {
                                    setShowLastDonationPicker(false);
                                }
                                if (selectedDate && event.type !== 'dismissed') {
                                    setLastDonationDate(selectedDate);
                                    setFormData({
                                        ...formData,
                                        last_donation_date: formatDateToDhaka(selectedDate),
                                    });
                                }
                            }}
                            maximumDate={new Date()}
                        />
                    )}
                </>
            )}

            <Text style={styles.helperText}>
                Leave empty if this is your first donation
            </Text>
        </ScrollView>
    );

    const renderPage3 = () => (
        <View style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Select Your Location</Text>
            <Text style={styles.helperText}>
                {isLoadingLocation
                    ? 'Loading address...'
                    : formData.address || 'Choose your location so people can find you when they need blood'}
            </Text>

            <View style={styles.mapContainer}>
                <LocationPicker
                    initialLocation={
                        formData.latitude && formData.longitude
                            ? {
                                name: formData.address || 'Selected Location',
                                latitude: parseFloat(formData.latitude),
                                longitude: parseFloat(formData.longitude),
                                address: formData.address,
                            }
                            : undefined
                    }
                    onLocationSelect={handleLocationSelect}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#C62828" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Become Donor</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                {[1, 2, 3].map((page) => (
                    <View
                        key={page}
                        style={[
                            styles.progressDot,
                            currentPage >= page && styles.progressDotActive,
                        ]}
                    />
                ))}
            </View>

            {/* Page Content */}
            {currentPage === 1 && renderPage1()}
            {currentPage === 2 && renderPage2()}
            {currentPage === 3 && renderPage3()}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                {currentPage < 3 ? (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.nextButtonText}>Submit</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

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
                onClose={() => {
                    setShowSuccess(false);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ddd',
    },
    progressDotActive: {
        backgroundColor: '#C62828',
        width: 30,
    },
    pageContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginBottom: 8,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    genderButtonActive: {
        backgroundColor: '#C62828',
        borderColor: '#C62828',
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    genderButtonTextActive: {
        color: '#fff',
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
    mapContainer: {
        flex: 1,
        marginTop: 16,
        overflow: 'hidden',
        minHeight: 400,
    },
    addressContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 16,
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    nextButton: {
        backgroundColor: '#C62828',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonDisabled: {
        backgroundColor: '#999',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
