import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider } from 'react-i18next';
import { store } from '../src/store';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { initializeAuth } from '../src/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import i18n, { initI18n } from '../src/i18n';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { ToastProvider } from '../src/components/Toast';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Safety net: never let the splash hang forever. If auth/i18n init doesn't
// finish within 5 seconds (e.g. SecureStore missing on Expo Go), force the
// app forward to the welcome screen.
const SAFETY_TIMEOUT_MS = 5000;

function FallbackSplash() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
        MtotoCare
      </Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
    </View>
  );
}

function RootStack() {
  const { theme } = useTheme();
  const authInitialized = useAppSelector(s => s.auth.initialized);
  const dispatch = useAppDispatch();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, []);

  useEffect(() => {
    if (authInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authInitialized]);

  // Force forward if init takes too long
  useEffect(() => {
    const t = setTimeout(() => {
      if (!authInitialized) {
        // eslint-disable-next-line no-console
        console.warn('[MtotoCare] Auth init timed out — forcing welcome screen');
        setTimedOut(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [authInitialized]);

  const ready = authInitialized || timedOut;
  if (!ready) {
    return <FallbackSplash />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(provider)" />
        <Stack.Screen name="provider-patient-detail" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="admin-settings" />
        <Stack.Screen name="admin-sync" />
        <Stack.Screen name="admin-patients" />
        <Stack.Screen name="admin-vaccines" />
        <Stack.Screen name="ai-chat" />
        <Stack.Screen name="vaccinations" />
        <Stack.Screen name="growth" />
        <Stack.Screen name="growth/add" />
        <Stack.Screen name="nutrition" />
        <Stack.Screen name="medical-records" />
        <Stack.Screen name="offline" />
        <Stack.Screen name="child-records/index" />
        <Stack.Screen name="child-records/add" />
        <Stack.Screen name="child-records/[id]" />
        <Stack.Screen name="choose-language" />
        <Stack.Screen name="appointments" />
        <Stack.Screen name="appointments/book" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/change-password" />
        <Stack.Screen name="profile/language" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/privacy" />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [i18nInited, setI18nInited] = useState(false);
  useEffect(() => {
    // Race initI18n against a 3s timeout so a slow expo-localization call
    // can't keep the splash up forever.
    const timeout = new Promise<void>((resolve) =>
      setTimeout(() => resolve(), 3000),
    );
    Promise.race([initI18n(), timeout]).finally(() => setI18nInited(true));
  }, []);

  if (!i18nInited) {
    return <FallbackSplash />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <SafeAreaProvider>
              <ThemeProvider>
                <ToastProvider>
                  <RootStack />
                </ToastProvider>
              </ThemeProvider>
            </SafeAreaProvider>
          </LanguageProvider>
        </I18nextProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}
