import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '@/components/ErrorDialog';
import { saveResetEmail } from '@/utils/storage';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSendCode = async () => {
        if (!validateEmail()) return;

        setIsSubmitting(true);
        try {
            const response = await apiCall('/verifications/send', {
                method: 'POST',
                body: {
                    email,
                    purpose: 'password_reset'
                },
                requiresAuth: false,
            });

            if (response.status_code === 200) {
                // Save email for verification page
                await saveResetEmail(email);
                // Navigate to verify page with reset mode
                router.push('/verify?mode=reset');
            } else {
                setErrorMessage(response.message || 'Failed to send verification code');
                setIsErrorVisible(true);
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to send verification code';
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
                Forgot Password?
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
                Enter your email address and we'll send you a verification code to reset your password.
            </Text>

            <View style={styles.inputContainer}>
                <Text variant="bodyMedium" style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder="Enter your email"
                    placeholderTextColor='#bbb'
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <Button
                mode="contained"
                onPress={handleSendCode}
                disabled={isSubmitting}
                style={styles.sendButton}
                labelStyle={styles.sendButtonText}
            >
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : 'Send Verification Code'}
            </Button>

            <TouchableOpacity
                style={styles.backToSigninContainer}
                onPress={() => router.push('/signin')}
                disabled={isSubmitting}
            >
                <Text style={styles.backToSigninText}>
                    Remember your password? <Text style={styles.signInLink}>Sign In</Text>
                </Text>
            </TouchableOpacity>

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
        marginBottom: 24,
        width: '100%',
    },
    label: {
        fontSize: 15,
        color: '#444',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        backgroundColor: '#fafafa',
        color: '#222',
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
    sendButton: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 6,
        backgroundColor: '#D32F2F',
        marginBottom: 16,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    backToSigninContainer: {
        marginTop: 8,
    },
    backToSigninText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    signInLink: {
        color: '#D32F2F',
        fontWeight: '600',
    },
});
