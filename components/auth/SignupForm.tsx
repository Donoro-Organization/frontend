import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAPI, apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { saveVerificationEmail } from '@/utils/storage';

interface SignupFormProps {
    onSignupSuccess: (email: string) => void;
    onSignupError: (error: string) => void;
    apiEndpoint: string;
}

export default function SignupForm({ onSignupSuccess, onSignupError, apiEndpoint }: SignupFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    // Use the useAPI hook for signup (POST request, no auth required)
    const { mutate, loading: submitting, error: apiError } = useAPI('/auth/signup', {
        method: 'POST',
        enabled: false, // Don't auto-fetch on mount
        requiresAuth: false, // Signup doesn't require authentication
    });

    // Email validation
    const validateEmail = (value: string) => {
        const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
        return re.test(String(value).toLowerCase());
    };

    // Password validation: at least 8 chars
    const validatePassword = (value: string) => {
        return value.length >= 8;
    };

    const handleSubmit = async () => {
        // Validate all fields
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);
        setPasswordsMatch(doPasswordsMatch);

        if (!(isEmailValid && isPasswordValid && doPasswordsMatch)) {
            return;
        }

        // Call backend signup API using the mutate function from useAPI hook
        try {
            await mutate({ email, password });

            // Save email for verification process
            await saveVerificationEmail(email);

            // Send verification code
            try {
                await apiCall('/verifications/send', {
                    method: 'POST',
                    body: { email },
                    requiresAuth: false,
                });
                console.log('Verification code sent to:', email);
            } catch (verificationError) {
                console.error('Failed to send verification code:', verificationError);
                // Don't block signup success, user can resend later
            }

            // If successful, call the success callback with email
            onSignupSuccess(email);
        } catch (err) {
            // Show error dialog with the error message
            const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setErrorMessage(errorMsg);
            setIsErrorVisible(true);
            onSignupError(errorMsg);
        }
    };

    return (
        <View style={styles.container}>
            {/* Email input */}
            <View style={[styles.inputBox, !emailValid && styles.inputBoxError]}>
                <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    placeholderTextColor="#bbb"
                    value={email}
                    onChangeText={text => {
                        setEmail(text);
                        if (!emailValid) setEmailValid(true);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {email.length > 0 && emailValid && (
                    <Ionicons name="checkmark" size={20} color="#2196F3" />
                )}
            </View>
            {!emailValid && (
                <Text style={styles.errorText}>Please enter a valid email address.</Text>
            )}

            {/* Password input */}
            <View style={[styles.inputBox, !passwordValid && styles.inputBoxError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Password (min. 8 characters)"
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={text => {
                        setPassword(text);
                        if (!passwordValid) setPasswordValid(true);
                        if (!passwordsMatch && confirmPassword) {
                            setPasswordsMatch(text === confirmPassword);
                        }
                    }}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
                </TouchableOpacity>
            </View>
            {!passwordValid && (
                <Text style={styles.errorText}>Password must be at least 8 characters.</Text>
            )}

            {/* Confirm Password input */}
            <View style={[styles.inputBox, !passwordsMatch && confirmPassword.length > 0 && styles.inputBoxError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#bbb"
                    value={confirmPassword}
                    onChangeText={text => {
                        setConfirmPassword(text);
                        setPasswordsMatch(password === text);
                    }}
                    secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
                </TouchableOpacity>
            </View>
            {!passwordsMatch && confirmPassword.length > 0 && (
                <Text style={styles.errorText}>Passwords do not match.</Text>
            )}

            {/* Submit button */}
            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                )}
            </TouchableOpacity>

            {/* Error Dialog */}
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
        width: '100%',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 18,
        width: '100%',
        height: 48,
        backgroundColor: '#fafafa',
    },
    inputBoxError: {
        borderColor: '#D32F2F',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 13,
        marginBottom: 6,
        alignSelf: 'flex-start',
        marginLeft: 4,
        marginTop: -12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#222',
    },
    submitButton: {
        backgroundColor: '#D32F2F',
        borderRadius: 14,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
});
