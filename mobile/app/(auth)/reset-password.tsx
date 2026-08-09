import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { authApi } from '../../src/api';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { getApiError } from '../../src/api/client';

/**
 * Reset password screen — opened from the email link.
 * Deep link: mtotocare://reset-password?token=xxxxx
 * Web fallback: /reset-password?token=xxxxx (handled by Expo Router)
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.token) {
      setToken(String(params.token));
    }
  }, [params.token]);

  const handleSubmit = async () => {
    if (!token) {
      showError('The reset link is invalid. Please request a new one.');
      return;
    }
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Please re-enter the same password twice.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      showSuccess('Your password has been updated. Please sign in.');
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    } catch (err: any) {
      showError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={[styles.iconCircle, { backgroundColor: theme.colors.featureBg }]}>
        <Ionicons name="key" size={48} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Set New Password</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Enter your new password below
      </Text>

      <Input
        label="Reset Token"
        value={token}
        onChangeText={setToken}
        placeholder="Paste the token from your email"
        autoCapitalize="none"
        autoCorrect={false}
        required
        hint="Auto-filled if you opened this from the email link"
      />

      <Input
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="At least 8 characters"
        secureTextEntry={!showPassword}
        required
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <Input
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Re-enter new password"
        secureTextEntry={!showPassword}
        required
      />

      <Button title="Reset Password" onPress={handleSubmit} loading={loading} fullWidth size="lg" />

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginBtn}>
        <Text style={[styles.loginText, { color: theme.colors.primary }]}>Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
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
