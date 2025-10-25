import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAPI } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { saveUserData } from '@/utils/storage';

interface SigninFormProps {
    onSigninSuccess: () => void;
    onSigninError: (error: string) => void;
}

export default function SigninForm({ onSigninSuccess, onSigninError }: SigninFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    // Use the useAPI hook for signin (POST request, no auth required)
    const { mutate, loading: submitting } = useAPI<{
        id: string;
        role: string;
        access_token: string;
        token_type: string;
    }>('/auth/signin', {
        method: 'POST',
        enabled: false,
        requiresAuth: false,
    });

    // Email validation
    const validateEmail = (value: string) => {
        const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
        return re.test(String(value).toLowerCase());
    };

    const handleSubmit = async () => {
        // Validate all fields
        const isEmailValid = validateEmail(email);
        const isPasswordValid = password.length > 0;

        setEmailValid(isEmailValid);
        setPasswordValid(isPasswordValid);

        if (!(isEmailValid && isPasswordValid)) {
            return;
        }

        // Call backend signin API
        try {
            const response = await mutate({ email, password });

            // Response format: { id, role, access_token, token_type }
            if (response && response.access_token) {
                // Save user data to AsyncStorage
                await saveUserData(
                    response.id,
                    response.role,
                    response.access_token
                );

                // Call success callback
                onSigninSuccess();
            }
        } catch (err) {
            // Show error dialog with the error message
            const errorMsg = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
            setErrorMessage(errorMsg);
            setIsErrorVisible(true);
            onSigninError(errorMsg);
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
                    placeholder="Enter your password"
                    placeholderTextColor="#bbb"
                    value={password}
                    onChangeText={text => {
                        setPassword(text);
                        if (!passwordValid) setPasswordValid(true);
                    }}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
                </TouchableOpacity>
            </View>
            {!passwordValid && (
                <Text style={styles.errorText}>Please enter your password.</Text>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
                style={styles.forgotRow}
                onPress={() => router.push('/forgot-password')}
                disabled={submitting}
            >
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit button */}
            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                {submitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>Sign In</Text>
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
    forgotRow: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 12,
        marginTop: -6,
    },
    forgotText: {
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500',
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
