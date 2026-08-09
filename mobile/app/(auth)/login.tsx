import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { login, clearError, setUser } from '../../src/store/slices/authSlice';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { isValidEmail } from '../../src/utils/validation';
import { apiClient } from '../../src/api/client';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { BiometricService, BiometricCapability } from '../../src/utils/biometric';
import { useToast } from '../../src/components/Toast';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, language: uiLang } = useLanguage();
  const { showError, showSuccess } = useToast();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Biometric state
  const [biometricCap, setBiometricCap] = useState<BiometricCapability | null>(null);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  // On mount, check whether biometric is set up AND we have saved credentials
  useEffect(() => {
    (async () => {
      const cap = await BiometricService.getCapability();
      setBiometricCap(cap);
      const creds = await BiometricService.getSavedCredentials();
      if (creds) setSavedEmail(creds.email);
    })();
  }, []);

  const handleLogin = async () => {
    setLocalError(null);
    dispatch(clearError());

    if (!email.trim()) {
      setLocalError(uiLang === 'sw' ? 'Tafadhali weka barua pepe yako' : 'Please enter your email');
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError(uiLang === 'sw' ? 'Tafadhali weka barua pepe halali' : 'Please enter a valid email');
      return;
    }
    if (!password) {
      setLocalError(uiLang === 'sw' ? 'Tafadhali weka nenosiri' : 'Please enter your password');
      return;
    }

    try {
      const result = await dispatch(login({ email: email.trim().toLowerCase(), password })).unwrap();
      navigateByRole(result.user.roles || []);
    } catch (err: any) {
      // Error is in state
    }
  };

  /**
   * Biometric login: prompt for fingerprint/face, then use the saved
   * refresh token to get a new access token from the backend.
   */
  const handleBiometricLogin = async () => {
    if (!biometricCap?.available) {
      showError(
        uiLang === 'sw'
          ? 'Sanidi fingerprint au face unlock kwenye mipangilio ya simu yako kwanza.'
          : 'Please set up fingerprint or face unlock in your device settings first.',
      );
      return;
    }
    setBiometricBusy(true);
    try {
      const success = await BiometricService.authenticate(
        uiLang === 'sw' ? `Ingia kwa ${biometricCap.displayName}` : `Sign in with ${biometricCap.displayName}`,
        uiLang === 'sw' ? 'Ghairi' : 'Cancel',
      );
      if (!success) {
        setBiometricBusy(false);
        return;
      }
      const creds = await BiometricService.getSavedCredentials();
      if (!creds) {
        showError(
          uiLang === 'sw' ? 'Hakuna akaunti iliyohifadhiwa. Tafadhali ingia kwa nenosiri kwanza.' : 'No saved account. Please log in with your password first.',
        );
        setBiometricBusy(false);
        return;
      }
      // Use the refresh token to get a new access token
      const res = await apiClient.post('/auth/refresh', { refreshToken: creds.refreshToken });
      const auth = res.data?.data;
      if (!auth?.accessToken) {
        throw new Error('Invalid refresh response');
      }
      // Save the new tokens
      await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
      if (auth.refreshToken) {
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);
        // Update saved credentials with new refresh token
        await BiometricService.saveCredentials(creds.email, auth.refreshToken);
      }
      if (auth.user) await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth.user));
      dispatch(setUser(auth.user));
      showSuccess(uiLang === 'sw' ? 'Umefanikiwa kuingia' : 'Signed in');
      navigateByRole(auth.user?.roles || []);
    } catch (e: any) {
      showError(
        uiLang === 'sw'
          ? 'Imeisha muda au kitu kimekwenda vibaya. Tafadhali ingia kwa nenosiri.'
          : 'Session expired or something went wrong. Please sign in with your password.',
      );
    } finally {
      setBiometricBusy(false);
    }
  };

  const navigateByRole = (roles: string[]) => {
    if (roles.includes('ADMIN')) {
      router.replace('/(admin)/dashboard');
    } else if (roles.some(r => ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER'].includes(r))) {
      router.replace('/(provider)/dashboard');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const showBiometricButton = biometricCap?.available && savedEmail;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <View style={[styles.logoIcon, { backgroundColor: theme.colors.featureBg }]}>
            <Ionicons name="heart" size={32} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.brand, { color: theme.colors.primary }]}>MTOTOCARE</Text>
            <Text style={[styles.brand, { color: theme.colors.primary }]}>AFRICA</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.welcomeBack')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {uiLang === 'sw' ? 'Ingia kuendelea' : 'Sign in to continue'}
        </Text>

        {(error || localError) && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {localError || error}
            </Text>
          </View>
        )}

        {/* Biometric quick-login (only if enabled) */}
        {showBiometricButton && (
          <TouchableOpacity
            style={[styles.biometricBtn, { backgroundColor: theme.colors.featureBg, borderColor: theme.colors.primary }]}
            onPress={handleBiometricLogin}
            disabled={biometricBusy || loading}
            activeOpacity={0.85}
          >
            {biometricBusy ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Ionicons
                name={biometricCap.type === 'face' ? 'scan' : 'finger-print'}
                size={22}
                color={theme.colors.primary}
              />
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.biometricTitle, { color: theme.colors.primary }]}>
                {uiLang === 'sw' ? `Ingia kwa ${biometricCap.displayName}` : `Sign in with ${biometricCap.displayName}`}
              </Text>
              <Text style={[styles.biometricSub, { color: theme.colors.textSecondary }]}>
                {savedEmail}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        {showBiometricButton && (
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
              {uiLang === 'sw' ? 'AU' : 'OR'}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
          </View>
        )}

        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={uiLang === 'sw' ? 'wewe@example.com' : 'you@example.com'}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          required
          leftIcon={<Ionicons name="mail" size={18} color={theme.colors.textSecondary} />}
        />

        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder={uiLang === 'sw' ? 'Weka nenosiri lako' : 'Enter your password'}
          secureTextEntry={!showPassword}
          required
          leftIcon={<Ionicons name="lock-closed" size={18} color={theme.colors.textSecondary} />}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          }
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotBtn}
        >
          <Text style={[styles.forgotText, { color: theme.colors.primary }]}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        <Button title={t('auth.login')} onPress={handleLogin} loading={loading} fullWidth size="lg" />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
          <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
            {uiLang === 'sw' ? 'AU' : 'OR'}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.divider }]} />
        </View>

        <Button
          title={t('auth.createAccount')}
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          fullWidth
          size="lg"
        />

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/welcome')}
        >
          <Text style={[styles.backText, { color: theme.colors.textSecondary }]}>
            ← {t('common.back')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, flex: 1 },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  biometricTitle: { fontSize: 15, fontWeight: '700' },
  biometricSub: { fontSize: 12, marginTop: 2 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { fontSize: 13 },
});
