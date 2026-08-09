import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { register, clearError } from '../../src/store/slices/authSlice';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { isValidEmail, isValidPhone, isStrongPassword } from '../../src/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalError(null);
    dispatch(clearError());

    if (!fullName.trim()) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      setLocalError('Please enter a valid phone number');
      return;
    }
    if (!isStrongPassword(password)) {
      setLocalError('Password must be 8-100 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await dispatch(register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phone.trim() || undefined,
        password,
        confirmPassword,
        preferredLanguage: 'en',
        deviceId: 'mobile-app',
      })).unwrap();
      // Show the language picker so the user can pick English or Kiswahili
      // before entering the app. The choice is applied and saved to the backend.
      router.replace('/choose-language' as any);
    } catch (err: any) {
      // Error in state
    }
  };

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

        <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.createAccount')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Join us to keep your children healthy
        </Text>

        {(error || localError) && (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {localError || error}
            </Text>
          </View>
        )}

        <Input
          label={t('auth.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Amina Juma"
          autoCapitalize="words"
          required
        />
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
        <Input
          label={`${t('auth.phone')} (optional)`}
          value={phone}
          onChangeText={setPhone}
          placeholder="+255 700 000 000"
          keyboardType="phone-pad"
        />
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          required
          hint={t('auth.password') === 'Password' ? 'Must be at least 8 characters' : 'Lazima iwe angalau herufi 8'}
        />
        <Input
          label={`${t('auth.password')} (confirm)`}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          secureTextEntry
          required
        />

        <Button title={t('auth.createAccount')} onPress={handleRegister} loading={loading} fullWidth size="lg" />

        <TouchableOpacity
          style={styles.linkBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
            {t('auth.haveAccount')}? <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  logoIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
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
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { fontSize: 14 },
});
