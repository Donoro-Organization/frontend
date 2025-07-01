import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CreateAccount() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/donoroLogo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.title}>Create your account</Text>
      <TouchableOpacity style={styles.emailButton} onPress={() => router.push('/(tabs)/RegisterPage')}>
        <Ionicons name="mail" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.emailButtonText}>Continue with Email</Text>
      </TouchableOpacity>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="google" size={24} color="#EA4335" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <FontAwesome name="facebook" size={24} color="#1877F3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <AntDesign name="apple1" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 16,
    marginTop: 32,
  },
  title: {
    fontSize: 18,
    color: '#444',
    marginBottom: 32,
    fontWeight: '500',
    textAlign: 'center',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
