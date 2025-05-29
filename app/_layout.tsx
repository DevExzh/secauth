import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
// Initialize i18n
import { initPromise } from '@/utils/i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (initPromise) {
      initPromise
        .then(() => {
          setI18nReady(true);
        })
        .catch((error) => {
          console.error('Failed to initialize i18n:', error);
          // Set to true anyway to prevent infinite loading
          setI18nReady(true);
        });
    } else {
      // If initPromise is null for some reason, set ready to true to prevent infinite loading
      setI18nReady(true);
    }
  }, []);

  if (!loaded || !i18nReady) {
    // Show loading screen while fonts or i18n are loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
