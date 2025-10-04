import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const router = useRouter();

  // Focus next input on change (React Native way)
  const inputs = useRef<Array<TextInput | null>>([]);
  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[idx] = text;
    setCode(newCode);
    // Auto-focus next input
    if (text && idx < 5 && inputs.current[idx + 1]) {
      inputs.current[idx + 1]?.focus();
    }
    // If all digits are filled, navigate to SignInPage
    if (newCode.every(d => d.length === 1)) {
      setTimeout(() => {
        router.push('/(tabs)/SignInPage');
      }, 300);
    }
  };

  const handleResend = () => {
    // Resend code logic here
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
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        Please enter the verification code <Text style={styles.bold}>we sent to your email address</Text> to complete the verification process.
      </Text>

      <View style={styles.codeRow}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={ref => { inputs.current[idx] = ref; }}
            style={styles.codeInput}
            value={digit}
            onChangeText={text => handleChange(text, idx)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            autoFocus={idx === 0}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
        <Text style={styles.resendButtonText}>Resend the code</Text>
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
    marginBottom: 32,
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
  },
  resendButton: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    color: '#222',
    fontSize: 16,
  },
});
