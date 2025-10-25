import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SignupForm from '../../components/auth/SignupForm';
import config from '../../config/config';

export default function RegisterPage() {
  const [agree, setAgree] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const API = config.BACKEND_API_ENDPOINT;
  console.log('API Endpoint from config:', API);

  const handleSignupSuccess = (email: string) => {
    // Navigate to verification screen on successful signup
    router.push('/verify-email');
  };

  const handleSignupError = (error: string) => {
    setServerError(error);
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
      <Text style={styles.title}>Create your account</Text>

      {/* Signup Form Component */}
      <SignupForm
        onSignupSuccess={handleSignupSuccess}
        onSignupError={handleSignupError}
        apiEndpoint={API}
      />

      {/* Server Error Message */}
      {serverError && (
        <Text style={styles.errorText}>{serverError}</Text>
      )}

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
    width: 180,
    height: 80,
    marginBottom: 16,
    marginTop: 8,
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
});
