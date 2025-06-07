import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
// Initialize i18n
import { initPromise } from '@/utils/i18n';
// Initialize logger
import { getLogger } from '@/utils/logger';
import { initializeLogger } from '@/utils/loggerConfig';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Please restart the app
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);
  const [loggerReady, setLoggerReady] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize logger first
        initializeLogger();
        setLoggerReady(true);
        
        // Now we can safely use logger
        const logger = getLogger('app.layout');
        logger.info('开始初始化应用');
        logger.info('日志系统初始化完成');

        // Initialize i18n
        logger.info('开始初始化国际化');
        if (initPromise) {
          await initPromise;
        }
        setI18nReady(true);
        logger.info('国际化初始化完成');

        logger.info('应用初始化完成');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Set to true anyway to prevent infinite loading
        setI18nReady(true);
        setLoggerReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!loaded || !i18nReady || !loggerReady) {
    // Show loading screen while fonts, i18n, or logger are loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              
              {/* Modal Screens */}
              <Stack.Screen 
                name="modals/data/import-data" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/data/export-data" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/settings/help-center" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/settings/about-app" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/email/email-settings" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/settings/connected-accounts" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/settings/cloud-sync" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />
              <Stack.Screen 
                name="modals/settings/sync-frequency" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }} 
              />

                          <Stack.Screen 
              name="modals/email/email-parsing" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-add-input" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-add-integration" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-advanced-settings" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-certificate-management" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-encryption-settings" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-connection-timeout" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/email/email-data-retention" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />

            <Stack.Screen 
              name="modals/auth/pin" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/auth/auto-lock" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/settings/theme" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/account/qr-code" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/account/edit-name" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/account/view-email" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }} 
            />
            <Stack.Screen 
              name="modals/account/qr-scanner" 
              options={{ 
                presentation: 'fullScreenModal',
                headerShown: false,
                gestureEnabled: false,
              }} 
            />
          </Stack>
          </ThemeProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
