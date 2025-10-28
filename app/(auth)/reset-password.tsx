import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { getResetToken, clearResetToken } from '@/utils/storage';

export default function ResetPassword() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null);

    useEffect(() => {
        loadResetToken();
    }, []);

    const loadResetToken = async () => {
        const token = await getResetToken();
        if (!token) {
            setErrorMessage('Invalid session. Please try again.');
            setIsErrorVisible(true);
            setTimeout(() => router.push('/forgot-password'), 2000);
        } else {
            setResetToken(token);
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = { newPassword: '', confirmPassword: '' };

        if (!newPassword) {
            newErrors.newPassword = 'Password is required';
            valid = false;
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
            valid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            valid = false;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleResetPassword = async () => {
        if (!validateForm() || !resetToken) return;

        setIsSubmitting(true);
        try {
            const response = await apiCall('/auth/reset-password', {
                method: 'POST',
                body: {
                    new_password: newPassword,
                },
                requiresAuth: false,
                headers: {
                    'Authorization': `Bearer ${resetToken}`,
                },
            });

            if (response.status_code === 200) {
                // Clear reset token
                await clearResetToken();

                // Show success message
                setErrorMessage('Password reset successfully! Please sign in with your new password.');
                setIsErrorVisible(true);

                // Navigate to signin after 2 seconds
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            } else {
                setErrorMessage(response.message || 'Failed to reset password');
                setIsErrorVisible(true);
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to reset password';
            setErrorMessage(errorMsg);
            setIsErrorVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>

            <Image
                source={require('@/assets/images/donoroLogo.png')}
                style={styles.logo}
                contentFit="contain"
            />

            <Text variant="headlineSmall" style={styles.title}>
                Reset Password
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Enter your new password
            </Text>

            <View style={styles.inputContainer}>
                <Text variant="bodyMedium" style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, errors.newPassword ? styles.inputError : null]}
                        placeholder="Enter new password"
                        placeholderTextColor='#bbb'
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                        }}
                        secureTextEntry={!showNewPassword}
                        editable={!isSubmitting}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        disabled={isSubmitting}
                    >
                        <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
                    </TouchableOpacity>
                </View>
                {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
                <Text variant="bodyMedium" style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.passwordInput, errors.confirmPassword ? styles.inputError : null]}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                        }}
                        secureTextEntry={!showConfirmPassword}
                        editable={!isSubmitting}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                    >
                        <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#888" />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <Button
                mode="contained"
                onPress={handleResetPassword}
                disabled={isSubmitting}
                style={styles.resetButton}
                labelStyle={styles.resetButtonText}
            >
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : 'Reset Password'}
            </Button>

            <ErrorDialog
                visible={isErrorVisible}
                message={errorMessage}
                onClose={() => setIsErrorVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        marginLeft: 2,
    },
    logo: {
        width: 250,
        height: 50,
        marginBottom: 24,
        marginTop: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 18,
        width: '100%',
    },
    label: {
        fontSize: 15,
        color: '#444',
        marginBottom: 8,
        fontWeight: '500',
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
    },
    passwordInput: {
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingRight: 50,
        fontSize: 15,
        backgroundColor: '#fafafa',
        color: '#222',
        width: '100%',
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
    resetButton: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 6,
        backgroundColor: '#D32F2F',
        marginTop: 8,
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
