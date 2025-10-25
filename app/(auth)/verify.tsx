import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { apiCall } from '@/hooks/useAPI';
import { getVerificationEmail, clearVerificationEmail, getResetEmail, saveResetToken } from '@/utils/storage';
import ErrorDialog from '@/components/ErrorDialog';

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'signup'; // 'signup' or 'reset'

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  // Focus next input on change (React Native way)
  const inputs = useRef<Array<TextInput | null>>([]);

  // Load email from storage on mount
  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = mode === 'reset'
        ? await getResetEmail()
        : await getVerificationEmail();

      setEmail(storedEmail);
      if (!storedEmail) {
        setErrorMessage(`No email found. Please ${mode === 'reset' ? 'try password reset' : 'sign up'} again.`);
        setIsErrorVisible(true);
      }
    };
    loadEmail();
  }, [mode]);

  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[idx] = text;
    setCode(newCode);
    // Reset verification status when user changes input
    setVerificationStatus('idle');
    // Auto-focus next input
    if (text && idx < 5 && inputs.current[idx + 1]) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      setIsErrorVisible(true);
      return;
    }

    if (!email) {
      setErrorMessage(`Email not found. Please ${mode === 'reset' ? 'try password reset' : 'sign up'} again.`);
      setIsErrorVisible(true);
      return;
    }

    setIsVerifying(true);
    try {
      const endpoint = mode === 'reset'
        ? '/verifications/forget-password/verify'
        : '/verifications/verify';

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: { email, code: verificationCode },
        requiresAuth: false,
      });

      if (response.status_code === 200) {
        setVerificationStatus('success');

        if (mode === 'reset') {
          // For password reset: save token and navigate to reset-password page
          if (response.data?.reset_token) {
            await saveResetToken(response.data.reset_token);
            setSuccessMessage('Code verified! Redirecting...');
            setTimeout(() => {
              router.push('/reset-password');
            }, 1500);
          }
        } else {
          // For email verification: navigate to signin
          setSuccessMessage('Email verified successfully!');
          await clearVerificationEmail();
          setTimeout(() => {
            router.push('/signin');
          }, 1500);
        }
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      setVerificationStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      setErrorMessage(errorMsg);
      setIsErrorVisible(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage(`Email not found. Please ${mode === 'reset' ? 'try password reset' : 'sign up'} again.`);
      setIsErrorVisible(true);
      return;
    }

    setIsResending(true);
    try {
      const response = await apiCall('/verifications/send', {
        method: 'POST',
        body: {
          email,
          purpose: mode === 'reset' ? 'password_reset' : 'email_verification'
        },
        requiresAuth: false,
      });

      if (response.status_code === 200) {
        setSuccessMessage('Verification code sent successfully!');
        // Clear the code inputs
        setCode(['', '', '', '', '', '']);
        setVerificationStatus('idle');
        if (inputs.current[0]) {
          inputs.current[0]?.focus();
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Failed to resend code. Please try again.');
        setIsErrorVisible(true);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to resend code. Please try again.';
      setErrorMessage(errorMsg);
      setIsErrorVisible(true);
    } finally {
      setIsResending(false);
    }
  };

  // Auto-verify when all digits are entered
  useEffect(() => {
    if (code.every(d => d.length === 1)) {
      handleVerify();
    }
  }, [code]);

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
      <Text variant="headlineMedium" style={styles.title}>
        {mode === 'reset' ? 'Reset Password' : 'Verify your email'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Please enter the verification code{' '}
        <Text style={styles.bold}>we sent to {email || 'your email address'}</Text>{' '}
        to {mode === 'reset' ? 'reset your password' : 'complete the verification process'}.
      </Text>

      <View style={styles.codeRow}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => { inputs.current[idx] = ref; }}
            style={[
              styles.codeInput,
              verificationStatus === 'success' && styles.codeInputSuccess,
              verificationStatus === 'error' && styles.codeInputError,
            ]}
            value={digit}
            onChangeText={text => handleChange(text, idx)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            autoFocus={idx === 0}
            editable={!isVerifying}
          />
        ))}
      </View>

      {successMessage ? (
        <Text style={styles.successText}>{successMessage}</Text>
      ) : null}

      <Button
        mode="outlined"
        onPress={handleResend}
        style={styles.resendButton}
        labelStyle={styles.resendButtonText}
        disabled={isResending || isVerifying}
        loading={isResending}
      >
        {isResending ? 'Sending...' : 'Resend the code'}
      </Button>

      {isVerifying && (
        <View style={styles.verifyingContainer}>
          <ActivityIndicator size="small" color="#D32F2F" />
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}

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
    width: 180,
    height: 80,
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    marginHorizontal: 8,
  },
  bold: {
    color: '#222',
    fontWeight: 'bold',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  codeInput: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 22,
    marginHorizontal: 6,
    backgroundColor: '#fafafa',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  codeInputSuccess: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
  },
  codeInputError: {
    borderColor: '#D32F2F',
    borderWidth: 2,
    backgroundColor: '#FFEBEE',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendButton: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 14,
    width: '100%',
    marginTop: 12,
  },
  resendButtonText: {
    color: '#222',
    fontSize: 16,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  verifyingText: {
    color: '#666',
    fontSize: 14,
  },
});
