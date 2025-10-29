import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthMode = 'signin' | 'signup';
export type OAuthProvider = 'google' | 'facebook' | null;

interface AuthContextType {
    authMode: AuthMode;
    setAuthMode: (mode: AuthMode) => void;
    activeOAuthProvider: OAuthProvider;
    setActiveOAuthProvider: (provider: OAuthProvider) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_MODE_KEY = '@auth_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authMode, setAuthModeState] = useState<AuthMode>('signin');
    const [activeOAuthProvider, setActiveOAuthProvider] = useState<OAuthProvider>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load authMode from AsyncStorage on mount
    useEffect(() => {
        const loadAuthMode = async () => {
            try {
                const storedMode = await AsyncStorage.getItem(AUTH_MODE_KEY);
                if (storedMode === 'signin' || storedMode === 'signup') {
                    setAuthModeState(storedMode);
                }
            } catch (error) {
                console.error('Error loading auth mode:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAuthMode();
    }, []);

    // Wrapper function to persist authMode changes
    const setAuthMode = async (mode: AuthMode) => {
        try {
            await AsyncStorage.setItem(AUTH_MODE_KEY, mode);
            setAuthModeState(mode);
        } catch (error) {
            console.error('Error saving auth mode:', error);
            setAuthModeState(mode);
        }
    };

    if (isLoading) {
        return null; // Or a loading component
    }

    return (
        <AuthContext.Provider
            value={{
                authMode,
                setAuthMode,
                activeOAuthProvider,
                setActiveOAuthProvider,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
