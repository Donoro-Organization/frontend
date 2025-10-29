import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import SignIn from '@/app/(auth)/signin';
import Register from '@/app/(auth)/register';

export default function OAuthRedirect() {
    const { authMode } = useAuth();

    // Render SignIn or Register based on authMode
    return authMode === 'signin' ? <SignIn /> : <Register />;
}
