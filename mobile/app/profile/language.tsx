import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { setUser } from '../../src/store/slices/authSlice';
import { usersApi } from '../../src/api';

const LANGUAGES = [
  { code: 'en' as const, name: 'English', native: 'English', flag: '🇬🇧', desc: 'Continue in English' },
  { code: 'sw' as const, name: 'Kiswahili', native: 'Kiswahili', flag: '🇹🇿', desc: 'Endelea kwa Kiswahili' },
];

/**
 * Language settings — Profile > Language.
 * Uses LanguageContext so the entire app re-renders when language changes.
 */
export default function LanguageScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { language, setLanguage } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile' as any);
  };

  const pickLanguage = async (code: 'en' | 'sw') => {
    if (code === language && !saving) return;
    setSaving(true);
    try {
      // 1) Apply locally so all screens re-render translated
      await setLanguage(code);
      await storage.setItem(STORAGE_KEYS.LANGUAGE, code);
      // 2) Persist to backend (used for emails and future sessions)
      if (user?.id) {
        try {
          const res = await usersApi.updateMe({ preferredLanguage: code });
          if (res?.data?.data) dispatch(setUser(res.data.data));
        } catch (e: any) {
          console.log('[lang] backend save failed:', e?.message || e);
        }
      }
    } catch (e: any) {
      showError(e?.message || 'Could not change language');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>
          {language === 'sw' ? 'Lugha' : 'Language'}
        </Text>
        {saving ? <ActivityIndicator color={theme.colors.primary} /> : <View style={{ width: 30 }} />}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.help, { color: theme.colors.textSecondary }]}>
          {language === 'sw'
            ? 'Chagua lugha unayopendelea. Itatumika kwenye programu nzima na kuhifadhiwa kwenye akaunti yako.'
            : 'Choose your preferred language. This will be used across the app and saved to your account.'}
        </Text>

        {LANGUAGES.map(lang => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                {
                  backgroundColor: isSelected ? theme.colors.featureBg : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => pickLanguage(lang.code)}
              activeOpacity={0.7}
              disabled={saving}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: theme.colors.text }]}>{lang.name}</Text>
                <Text style={[styles.langNative, { color: theme.colors.textSecondary }]}>{lang.desc}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  h1: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 4 },
  content: { padding: 16 },
  help: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, marginBottom: 8, gap: 12,
  },
  flag: { fontSize: 32 },
  langName: { fontSize: 15, fontWeight: '700' },
  langNative: { fontSize: 12, marginTop: 2 },
});
