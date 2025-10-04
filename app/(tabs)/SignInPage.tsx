import { Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    // Navigate to loading page after sign in
    router.push('/(tabs)/LoadingPage');
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
      <Text style={styles.subtitle}>Log into your account</Text>
      <View style={styles.inputBox}>
        <Feather name="mail" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Enter your email address"
          placeholderTextColor="#bbb"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputBox}>
        <Feather name="lock" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#bbb"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
          <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={styles.forgotRow}>
        <Text style={styles.forgotText} onPress={() => {}}>
          Forgot password?
        </Text>
      </View>
      <Text style={styles.orText}>or</Text>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="google" size={22} color="#D32F2F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={22} color="#1976D2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="apple" size={22} color="#222" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={handleSignIn}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  forgotRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  orText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    backgroundColor: '#fff',
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  signInButton: {
    backgroundColor: '#1976D2',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});
