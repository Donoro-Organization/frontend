import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SigninForm from '../../components/auth/SigninForm';

export default function SigninPage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const handleSigninSuccess = () => {
        // Navigate to loading page or home on successful signin
        router.push('/home-page');
    };

    const handleSigninError = (error: string) => {
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
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        marginLeft: 2,
    },
    logo: {
        width: 740,
        height: 300,
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
