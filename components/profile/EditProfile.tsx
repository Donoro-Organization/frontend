import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { User, Gender, UserRole } from '@/types/user';
import { BloodGroup } from '@/types/bloodRequest';
import { UserProfileUpdateData, DonorProfileUpdateData } from '@/types/profile';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import SuccessDialog from '@/components/SuccessDialog';
import LocationPicker, { SelectedLocation } from '@/components/LocationPicker';
import BloodGroupPicker from '@/components/BloodGroupPicker';

interface EditProfileProps {
    user: User;
    donorData?: any;
    onSave?: () => void;
}

const formatDateForInput = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    } catch {
        return '';
    }
};

export default function EditProfile({ user, donorData, onSave }: EditProfileProps) {
    const router = useRouter();
    const isDonor = user.role === UserRole.DONOR;

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [showLastDonationPicker, setShowLastDonationPicker] = useState(false);
    const [birthDate, setBirthDate] = useState<Date>(
        user.birth_date ? new Date(user.birth_date) : new Date()
    );
    const [lastDonationDate, setLastDonationDate] = useState<Date>(
        donorData?.last_donation_date ? new Date(donorData.last_donation_date) : new Date()
    );
    const [profileImageUri, setProfileImageUri] = useState<string | undefined>(
        user.profile_image?.url
    );
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const [formData, setFormData] = useState<DonorProfileUpdateData>({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        gender: user.gender || undefined,
        birth_date: user.birth_date ? formatDateForInput(user.birth_date) : '',
        latitude: user.latitude || '',
        longitude: user.longitude || '',
        address: user.address || '',
        // Donor-specific fields (will be ignored for non-donors)
        blood_group: donorData?.blood_group || undefined,
        last_donation_date: donorData?.last_donation_date
            ? formatDateForInput(donorData.last_donation_date)
            : '',
        nid_number: donorData?.nid_number || '',
    });

    useEffect(() => {
        // If page 3 is showing location and no address, set loading
        if (!formData.address) {
            setIsLoadingLocation(true);
        }
    }, []);

    const handleLocationSelect = (location: SelectedLocation) => {
        setIsLoadingLocation(false);
        setFormData((prev) => ({
            ...prev,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            address: location.address || location.name,
        }));
    };

    const handlePickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setErrorMessage('Permission to access media library is required');
                setShowError(true);
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setProfileImageUri(imageUri);
                await uploadProfileImage(imageUri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            setErrorMessage('Failed to pick image');
            setShowError(true);
        }
    };

    const uploadProfileImage = async (imageUri: string) => {
        setUploadingImage(true);
        try {
            // Create FormData
            const formData = new FormData();

            // Get file extension
            const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

            // Add file to FormData
            formData.append('file', {
                uri: imageUri,
                type: mimeType,
                name: `profile.${fileExtension}`,
            } as any);

            // Upload to API
            const result = await apiCall('/users/profile/image', {
                method: 'PUT',
                body: formData,
                requiresAuth: true,
            });

            if (result.status_code === 200) {
                setSuccessMessage('Profile image updated successfully');
                setShowSuccess(true);
            } else {
                throw new Error(result.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image');
            setShowError(true);
            // Revert image on error
            setProfileImageUri(user.profile_image?.url);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        try {
            setUploadingImage(true);
            const result = await apiCall('/users/profile/image', {
                method: 'DELETE',
                requiresAuth: true,
            });

            if (result.status_code === 200) {
                setProfileImageUri(undefined);
                setSuccessMessage('Profile image deleted successfully');
                setShowSuccess(true);
            } else {
                throw new Error(result.message || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting profile image:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to delete image');
            setShowError(true);
        } finally {
            setUploadingImage(false);
        }
    };

    const validateForm = (): boolean => {
        if (!formData.first_name?.trim()) {
            setErrorMessage('Please enter your first name');
            setShowError(true);
            return false;
        }
        if (!formData.last_name?.trim()) {
            setErrorMessage('Please enter your last name');
            setShowError(true);
            return false;
        }
        if (!formData.phone?.trim()) {
            setErrorMessage('Please enter your phone number');
            setShowError(true);
            return false;
        }
        if (!formData.gender) {
            setErrorMessage('Please select your gender');
            setShowError(true);
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Prepare data based on user role
            const updateData: UserProfileUpdateData | DonorProfileUpdateData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                bio: formData.bio,
                phone: formData.phone,
                gender: formData.gender,
                birth_date: formData.birth_date ? `${formData.birth_date}T00:00:00` : undefined,
                latitude: formData.latitude,
                longitude: formData.longitude,
                address: formData.address,
            };

            // Add donor-specific fields if user is a donor
            if (isDonor) {
                (updateData as DonorProfileUpdateData).blood_group = formData.blood_group;
                (updateData as DonorProfileUpdateData).last_donation_date = formData.last_donation_date
                    ? `${formData.last_donation_date}T00:00:00`
                    : undefined;
                (updateData as DonorProfileUpdateData).nid_number = formData.nid_number;
            }

            // Call appropriate API endpoint
            const endpoint = isDonor ? '/donors/profile' : '/users/profile';
            const result = await apiCall(endpoint, {
                method: 'PUT',
                body: updateData,
                requiresAuth: true,
            });

            if (result.status_code === 200) {
                setSuccessMessage('Profile updated successfully');
                setShowSuccess(true);
                setTimeout(() => {
                    onSave?.();
                    router.back();
                }, 1500);
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#C62828" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={styles.saveButton}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#C62828" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <View style={styles.imageContainer}>
                        {profileImageUri ? (
                            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Ionicons name="person" size={60} color="#999" />
                            </View>
                        )}
                        {uploadingImage && (
                            <View style={styles.imageLoadingOverlay}>
                                <ActivityIndicator size="large" color="#C62828" />
                            </View>
                        )}
                    </View>
                    <View style={styles.imageButtons}>
                        <TouchableOpacity
                            style={styles.imageButton}
                            onPress={handlePickImage}
                            disabled={uploadingImage}
                        >
                            <Ionicons name="camera" size={20} color="#C62828" />
                            <Text style={styles.imageButtonText}>Change Photo</Text>
                        </TouchableOpacity>
                        {profileImageUri && (
                            <TouchableOpacity
                                style={[styles.imageButton, styles.deleteImageButton]}
                                onPress={handleDeleteImage}
                                disabled={uploadingImage}
                            >
                                <Ionicons name="trash" size={20} color="#C62828" />
                                <Text style={styles.imageButtonText}>Delete Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

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

                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.bioInput]}
                        placeholder="Tell us about yourself"
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        multiline
                        numberOfLines={3}
                        maxLength={500}
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
                                        formData.gender === option.value &&
                                        styles.genderButtonTextActive,
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
                                    {formData.birth_date || 'Select birth date'}
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
                                            const formattedDate = selectedDate
                                                .toISOString()
                                                .split('T')[0];
                                            setFormData({
                                                ...formData,
                                                birth_date: formattedDate,
                                            });
                                            if (Platform.OS === 'ios') {
                                                setShowBirthDatePicker(false);
                                            }
                                        }
                                    }}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                </View>

                {/* Donor-specific fields */}
                {isDonor && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Donor Information</Text>

                        <Text style={styles.label}>Blood Group</Text>
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
                                onChangeText={(text) =>
                                    setFormData({ ...formData, last_donation_date: text })
                                }
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
                                        {formData.last_donation_date || 'Select date'}
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
                                                const formattedDate = selectedDate
                                                    .toISOString()
                                                    .split('T')[0];
                                                setFormData({
                                                    ...formData,
                                                    last_donation_date: formattedDate,
                                                });
                                                if (Platform.OS === 'ios') {
                                                    setShowLastDonationPicker(false);
                                                }
                                            }
                                        }}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </>
                        )}

                        <Text style={styles.label}>NID Number (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your NID number"
                            value={formData.nid_number}
                            onChangeText={(text) => setFormData({ ...formData, nid_number: text })}
                            keyboardType="numeric"
                        />
                    </View>
                )}

                {/* Location Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <Text style={styles.helperText}>
                        {isLoadingLocation
                            ? 'Loading address...'
                            : formData.address ||
                            'Select your location so people can find you when they need help'}
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
                            defaultHeight={320}
                        />
                    </View>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        backgroundColor: '#fff',
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
    saveButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#C62828',
    },
    scrollView: {
        flex: 1,
    },
    imageSection: {
        backgroundColor: '#fff',
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 8,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholderImage: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C62828',
    },
    deleteImageButton: {
        borderColor: '#999',
    },
    imageButtonText: {
        fontSize: 14,
        color: '#C62828',
        fontWeight: '500',
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
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
        color: '#333',
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
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
        height: 320,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
});
