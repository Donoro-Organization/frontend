import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotificationObserver } from '@/hooks/useNotification';
import { PostUploadProvider } from '@/contexts/PostUploadContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PushNotificationProvider } from '@/contexts/PushNotificationContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D32F2F',
    secondary: '#FF5252',
    error: '#D32F2F',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationObserver();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <PushNotificationProvider>
        <NotificationProvider>
          <PostUploadProvider>
            <PaperProvider theme={paperTheme}>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }} />
                <StatusBar style="auto" />
              </ThemeProvider>
            </PaperProvider>
          </PostUploadProvider>
        </NotificationProvider>
      </PushNotificationProvider>
    </AuthProvider>
  );
}
