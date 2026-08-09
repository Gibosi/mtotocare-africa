import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { authApi } from '../../src/api';
import { Button } from '../../src/components/Button';
import { useToast } from '../../src/components/Toast';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile' as any);
  };

  const handleChange = async () => {
    if (!current) {
      showError('Please enter your current password.');
      return;
    }
    if (next.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      showError('New password and confirmation do not match.');
      return;
    }
    if (current === next) {
      showError('Your new password must be different from the current one.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: current, newPassword: next });
      showSuccess('Password changed. Please log in again with your new password.');
      setCurrent(''); setNext(''); setConfirm('');
      // Sign out and return to login
      setTimeout(async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        router.replace('/(auth)/login' as any);
      }, 1200);
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: theme.colors.text }]}>{t('profile.changePassword')}</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={[styles.icon, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.help, { color: theme.colors.textSecondary }]}>
          Choose a strong password with at least 8 characters.
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Current Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={current}
              onChangeText={setCurrent}
              placeholder="Enter current password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowCurrent(!showCurrent)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Ionicons
                name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password *</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              value={next}
              onChangeText={setNext}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!showNext}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowNext(!showNext)}
              style={styles.eyeBtn}
              hitSlop={8}
            >
              <Ionicons
                name={showNext ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm New Password *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter new password"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry={!showNext}
            autoCapitalize="none"
          />
        </View>

        <Button
          title={t('profile.changePassword')}
          onPress={handleChange}
          loading={saving}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
          style={{ marginTop: 20 }}
        />

        <TouchableOpacity onPress={goBack} style={styles.cancelBtn} activeOpacity={0.7}>
          <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 20, fontWeight: '700' },
  icon: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 8,
  },
  help: { fontSize: 13, textAlign: 'center', marginTop: 12, marginBottom: 24, paddingHorizontal: 16 },
  form: { marginBottom: 8 },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, flex: 1,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { fontSize: 14, fontWeight: '500' },
});
