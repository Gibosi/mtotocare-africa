import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { authApi } from '../../src/api';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { isValidEmail } from '../../src/utils/validation';
import { getApiError } from '../../src/api/client';
import { useToast } from '../../src/components/Toast';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      showSuccess('If an account exists with that email, a reset link has been sent.');
      setTimeout(() => router.replace('/(auth)/login'), 1200);
    } catch (err: any) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={[styles.iconCircle, { backgroundColor: theme.colors.featureBg }]}>
        <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Enter your email and we'll send you a reset link
      </Text>

      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} fullWidth size="lg" />

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginBtn}>
        <Text style={[styles.loginText, { color: theme.colors.primary }]}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 24 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32 },
  loginBtn: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, fontWeight: '600' },
});
