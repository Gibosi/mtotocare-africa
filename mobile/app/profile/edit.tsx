import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { setUser } from '../../src/store/slices/authSlice';
import { usersApi } from '../../src/api';
import { Button } from '../../src/components/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [language, setLanguage] = useState((user?.preferredLanguage || 'en') as string);
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile' as any);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      showError('Please enter your full name.');
      return;
    }
    if (!user?.id) {
      showError('User not loaded. Please login again.');
      return;
    }
    setSaving(true);
    try {
      const res = await usersApi.updateMe({
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined,
        preferredLanguage: language,
      });
      // Update local redux user
      if (res?.data?.data) {
        dispatch(setUser(res.data.data));
      } else {
        // Fallback: just update locally
        dispatch(setUser({ ...user, fullName: fullName.trim(), phoneNumber: phone.trim() || undefined, preferredLanguage: language } as any));
      }
      showSuccess('Your profile has been updated');
      setTimeout(goBack, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || e?.message || 'Could not update profile');
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
          <Text style={[styles.h1, { color: theme.colors.text }]}>{t('profile.editProfile')}</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={[styles.avatar, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="person" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email}</Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('auth.phone')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+255..."
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Preferred Language</Text>
          <View style={styles.langRow}>
            {[
              { value: 'en', label: 'English' },
              { value: 'sw', label: 'Kiswahili' },
            ].map(l => {
              const selected = language === l.value;
              return (
                <TouchableOpacity
                  key={l.value}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setLanguage(l.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langText,
                      { color: selected ? '#FFFFFF' : theme.colors.text },
                    ]}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
          style={{ marginTop: 20 }}
        />

        <TouchableOpacity
          onPress={goBack}
          style={[styles.cancelBtn]}
          activeOpacity={0.7}
        >
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
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 8,
  },
  email: { fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  form: { marginBottom: 8 },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  langRow: { flexDirection: 'row', gap: 8 },
  langChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  langText: { fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { fontSize: 14, fontWeight: '500' },
});
