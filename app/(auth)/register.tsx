import { Feather, Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import SignupForm from '../../components/auth/SignupForm';
import config from '../../config/config';
import { useGoogleAuth, getGoogleUserInfo } from '../../utils/googleAuth';
import { useFacebookAuth, getFacebookUserInfo } from '../../utils/facebookAuth';
import { apiCall } from '@/hooks/useAPI';
import ErrorDialog from '../../components/ErrorDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { activeOAuthProvider, setActiveOAuthProvider, setAuthMode } = useAuth();
  const { request, promptAsync, response } = useGoogleAuth();
  const { promptAsync: facebookPromptAsync, response: facebookResponse } = useFacebookAuth();

  const API = config.BACKEND_API_ENDPOINT;

  // Set authMode to signup when component mounts
  useEffect(() => {
    setAuthMode('signup');
  }, []);

  // Sync loading states with active provider
  useEffect(() => {
    setIsGoogleLoading(activeOAuthProvider === 'google');
    setIsFacebookLoading(activeOAuthProvider === 'facebook');
  }, [activeOAuthProvider]);

  // Debug: Check if request is ready
  useEffect(() => {
    console.log('🔧 Google Auth Request:', request ? 'Ready' : 'Not Ready');
    console.log('🔧 PromptAsync:', typeof promptAsync);
  }, [request]);

  // Handle Google OAuth response
  useEffect(() => {
    console.log('🟡 Google OAuth response changed:', response?.type);

    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('🟢 OAuth Success! Access token:', authentication?.accessToken ? 'Present' : 'Missing');

      if (authentication?.accessToken) {
        handleGoogleSignup(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.error('🔴 OAuth Error:', response);
      setIsGoogleLoading(false);
      setActiveOAuthProvider(null);
      setErrorMessage('Google sign-in failed. Please try again.');
      setErrorVisible(true);
    } else if (response?.type === 'cancel') {
      console.log('🟠 OAuth Cancelled by user');
      setIsGoogleLoading(false);
      setActiveOAuthProvider(null);
    }
  }, [response]);

  // Handle Facebook OAuth response
  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      const { authentication } = facebookResponse;
      if (authentication?.accessToken) {
        handleFacebookSignup(authentication.accessToken);
      }
    } else if (facebookResponse?.type === 'error') {
      setIsFacebookLoading(false);
      setErrorMessage('Facebook sign-in failed. Please try again.');
      setErrorVisible(true);
    } else if (facebookResponse?.type === 'cancel') {
      setIsFacebookLoading(false);
    }
  }, [facebookResponse]);

  const handleGoogleSignup = async (accessToken: string) => {
    try {
      setIsGoogleLoading(true);
      setActiveOAuthProvider('google');

      // Get user info from Google
      const userInfo = await getGoogleUserInfo(accessToken);

      if (!userInfo) {
        throw new Error('Failed to get user information from Google');
      }

      // Call your backend API for social signup using apiCall
      const data = await apiCall('/auth/signup/social', {
        method: 'POST',
        body: {
          email: userInfo.email,
          name: userInfo.name || '',
          picture: userInfo.picture || null,
          social_platform: 'google',
          access_token: accessToken,
        },
        requiresAuth: false,
      });

      if (data.status_code < 400) {
        router.push('/signin');
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Google signup error:', error);

      // Show the exact error message from backend
      setErrorMessage(error.message);
      setErrorVisible(true);
    } finally {
      setIsGoogleLoading(false);
      setActiveOAuthProvider(null);
    }
  };

  const handleFacebookSignup = async (accessToken: string) => {
    try {
      setIsFacebookLoading(true);
      setActiveOAuthProvider('facebook');

      // Get user info from Facebook
      const userInfo = await getFacebookUserInfo(accessToken);

      if (!userInfo) {
        throw new Error('Failed to get user information from Facebook');
      }

      // Call your backend API for social signup using apiCall
      const data = await apiCall('/auth/signup/social', {
        method: 'POST',
        body: {
          email: userInfo.email,
          name: userInfo.name || '',
          picture: userInfo.picture || null,
          social_platform: 'facebook',
          access_token: accessToken,
        },
        requiresAuth: false,
      });

      if (data.status_code < 400) {
        router.push('/signin');
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Facebook signup error:', error);

      // Show the exact error message from backend
      setErrorMessage(error.message);
      setErrorVisible(true);
    } finally {
      setIsFacebookLoading(false);
      setActiveOAuthProvider(null);
    }
  };

  const handleGooglePress = async () => {
    console.log('🔵 Google button clicked!');
    console.log('🔵 Terms agreed:', agree);

    if (!agree) {
      setErrorMessage('Please agree to the Terms & Conditions first');
      setErrorVisible(true);
      return;
    }

    setIsGoogleLoading(true);
    setActiveOAuthProvider('google');
    console.log('🔵 Calling promptAsync...');

    try {
      const result = await promptAsync({ showInRecents: true });
      console.log('🔵 promptAsync result:', JSON.stringify(result, null, 2));

      if (result.type === 'dismiss' || result.type === 'cancel') {
        console.log('🟠 User cancelled OAuth');
        setIsGoogleLoading(false);
        setActiveOAuthProvider(null);
      }
    } catch (error) {
      console.error('🔴 Error in promptAsync:', error);
      setIsGoogleLoading(false);
      setActiveOAuthProvider(null);
      setErrorMessage('Failed to initiate Google sign-in');
      setErrorVisible(true);
    }
  };

  const handleFacebookPress = async () => {
    if (!agree) {
      setErrorMessage('Please agree to the Terms & Conditions first');
      setErrorVisible(true);
      return;
    }

    setIsFacebookLoading(true);
    setActiveOAuthProvider('facebook');

    try {
      const result = await facebookPromptAsync({ showInRecents: true });

      if (result.type === 'dismiss' || result.type === 'cancel') {
        setIsFacebookLoading(false);
        setActiveOAuthProvider(null);
      }
    } catch (error) {
      console.error('Error in Facebook OAuth:', error);
      setIsFacebookLoading(false);
      setActiveOAuthProvider(null);
      setErrorMessage('Failed to initiate Facebook sign-in');
      setErrorVisible(true);
    }
  };

  const handleSignupSuccess = (email: string) => {
    router.push('/verify');
  };

  const handleSignupError = (error: string) => {
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
        <Text style={styles.title}>Create your account</Text>

        {/* Signup Form Component */}
        <SignupForm
          onSignupSuccess={handleSignupSuccess}
          onSignupError={handleSignupError}
          apiEndpoint={API}
        />

        {/* Social Sign Up Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Sign Up Buttons */}
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

        {/* Terms and conditions */}
        <View style={styles.termsRow}>
          <TouchableOpacity onPress={() => setAgree(!agree)} style={styles.checkboxContainer}>
            <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
              {agree && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree with{' '}
            <Text style={styles.link} onPress={() => Linking.openURL('https://your-terms-url.com')}>
              Terms & Conditions
            </Text>
          </Text>
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  termsText: {
    color: '#222',
    fontSize: 15,
  },
  link: {
    color: '#1976D2',
    textDecorationLine: 'underline',
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
    marginBottom: 18,
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
