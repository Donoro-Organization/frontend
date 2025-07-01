
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const router = useRouter();

  // Email validation
  const validateEmail = (value: string) => {
    // Simple regex for email validation
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  };

  // Password validation: at least 6 chars, at least 1 letter and 1 number
  const validatePassword = (value: string) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value);
  };

  const handleContinue = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    setEmailValid(isEmailValid);
    setPasswordValid(isPasswordValid);
    if (isEmailValid && isPasswordValid && agree) {
      // Here you would send the verification code to the user's email
      router.push('/(tabs)/VerifyEmail');
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
      <Text style={styles.title}>Create your account</Text>
      {/* Username input */}
      <View style={styles.inputBox}>
        <Ionicons name="person-outline" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Enter your user name"
          placeholderTextColor="#bbb"
          value={username}
          onChangeText={setUsername}
        />
        {username.length > 0 && (
          <Ionicons name="checkmark" size={20} color="#2196F3" />
        )}
      </View>
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
            if (emailValid !== true) setEmailValid(true);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {email.length > 0 && emailValid && (
          <Ionicons name="checkmark" size={20} color="#2196F3" />
        )}
      </View>
      {/* Password input */}
      <View style={[styles.inputBox, !passwordValid && styles.inputBoxError]}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (passwordValid !== true) setPasswordValid(true);
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
        </TouchableOpacity>
      </View>
      {/* Error messages */}
      {!emailValid && (
        <Text style={styles.errorText}>Please enter a valid email address.</Text>
      )}
      {!passwordValid && (
        <Text style={styles.errorText}>Password must be at least 6 characters and contain a letter and a number.</Text>
      )}
      {/* Continue button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  continueButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
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
