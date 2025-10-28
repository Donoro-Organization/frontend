import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import SigninForm from '../../components/auth/SigninForm';
import config from '../../config/config';
import { useGoogleAuth, getGoogleUserInfo } from '../../utils/googleAuth';
import { useFacebookAuth, getFacebookUserInfo } from '../../utils/facebookAuth';
import { apiCall } from '@/hooks/useAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorDialog from '../../components/ErrorDialog';
import { saveUserData } from '@/utils/storage';

export default function SigninPage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { promptAsync, response } = useGoogleAuth();
    const { promptAsync: facebookPromptAsync, response: facebookResponse } = useFacebookAuth();


    // Handle Google OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleGoogleSignin(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            setIsGoogleLoading(false);
            setErrorMessage('Google sign-in failed. Please try again.');
            setErrorVisible(true);
        }
    }, [response]);

    // Handle Facebook OAuth response
    useEffect(() => {
        if (facebookResponse?.type === 'success') {
            const { authentication } = facebookResponse;
            if (authentication?.accessToken) {
                handleFacebookSignin(authentication.accessToken);
            }
        } else if (facebookResponse?.type === 'error') {
            setIsFacebookLoading(false);
            setErrorMessage('Facebook sign-in failed. Please try again.');
            setErrorVisible(true);
        }
    }, [facebookResponse]);

    const handleGoogleSignin = async (accessToken: string) => {
        try {
            setIsGoogleLoading(true);

            // Get user info from Google
            const userInfo = await getGoogleUserInfo(accessToken);

            if (!userInfo) {
                throw new Error('Failed to get user information from Google');
            }

            // Call your backend API for social signin using apiCall
            const response = await apiCall('/auth/signin/social', {
                method: 'POST',
                body: {
                    email: userInfo.email,
                    social_platform: 'google',
                    access_token: accessToken,
                },
                requiresAuth: false,
            });

            if (response.access_token) {
                // Store token and user data
                await saveUserData(
                    response.id,
                    response.role,
                    response.access_token
                );

                router.push('/dev-menu');
            } else {
                throw new Error('Sign in failed');
            }
        } catch (error: any) {
            console.error('Google signin error:', error);

            // Show the exact error message from backend
            setErrorMessage(error.message);
            setErrorVisible(true);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleFacebookSignin = async (accessToken: string) => {
        try {
            setIsFacebookLoading(true);

            // Get user info from Facebook
            const userInfo = await getFacebookUserInfo(accessToken);

            if (!userInfo) {
                throw new Error('Failed to get user information from Facebook');
            }

            // Call your backend API for social signin using apiCall
            const response = await apiCall('/auth/signin/social', {
                method: 'POST',
                body: {
                    email: userInfo.email,
                    social_platform: 'facebook',
                    access_token: accessToken,
                },
                requiresAuth: false,
            });

            if (response.access_token) {
                // Store token and user data
                await saveUserData(
                    response.id,
                    response.role,
                    response.access_token
                );

                router.push('/dev-menu');
            } else {
                throw new Error('Sign in failed');
            }
        } catch (error: any) {
            console.error('Facebook signin error:', error);

            // Show the exact error message from backend
            setErrorMessage(error.message);
            setErrorVisible(true);
        } finally {
            setIsFacebookLoading(false);
        }
    };

    const handleGooglePress = async () => {
        setIsGoogleLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            setIsGoogleLoading(false);
            setErrorMessage('Failed to initiate Google sign-in');
            setErrorVisible(true);
        }
    };

    const handleFacebookPress = async () => {
        setIsFacebookLoading(true);
        try {
            await facebookPromptAsync();
        } catch (error) {
            setIsFacebookLoading(false);
            setErrorMessage('Failed to initiate Facebook sign-in');
            setErrorVisible(true);
        }
    };

    const handleSigninSuccess = () => {
        router.push('/dev-menu');
    };

    const handleSigninError = (error: string) => {
        setServerError(error);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={28} color="#222" />
            </TouchableOpacity>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require('@/assets/images/donoroLogo.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
                <Text style={styles.title}>Log into your account</Text>

                {/* Signin Form Component */}
                <SigninForm
                    onSigninSuccess={handleSigninSuccess}
                    onSigninError={handleSigninError}
                />

                {/* Social Sign In Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.divider} />
                </View>

                {/* Social Sign In Buttons */}
                <View style={styles.socialRow}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleGooglePress}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <ActivityIndicator size="small" color="#EA4335" />
                        ) : (
                            <AntDesign name="google" size={24} color="#EA4335" />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleFacebookPress}
                        disabled={isFacebookLoading}
                    >
                        {isFacebookLoading ? (
                            <ActivityIndicator size="small" color="#1877F3" />
                        ) : (
                            <FontAwesome name="facebook" size={24} color="#1877F3" />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Error Dialog */}
            <ErrorDialog
                visible={errorVisible}
                message={errorMessage}
                onClose={() => setErrorVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        marginLeft: 2,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 32,
    },
    logo: {
        width: 250,
        height: 50,
        marginBottom: 24,
        marginTop: 32,
    },
    title: {
        fontSize: 18,
        color: '#444',
        marginBottom: 32,
        fontWeight: '500',
        textAlign: 'center',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 13,
        marginBottom: 12,
        alignSelf: 'flex-start',
        marginLeft: 4,
        textAlign: 'center',
        width: '100%',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 18,
        marginBottom: 18,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    orText: {
        marginHorizontal: 12,
        color: '#888',
        fontSize: 15,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 4,
    },
    socialButton: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        backgroundColor: '#fff',
    },
});
