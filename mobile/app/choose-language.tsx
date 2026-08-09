import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { usersApi } from '../src/api';
import { setUser } from '../src/store/slices/authSlice';

/**
 * Post-registration language picker.
 * Appears right after a parent registers their account.
 * Lets them pick English or Kiswahili before landing on the home screen.
 *
 * The chosen language is:
 *  1) Applied locally (UI re-renders immediately)
 *  2) Saved to the backend (PUT /users/me)
 *  3) Used for all future emails (welcome, password reset)
 */
export default function ChooseLanguageScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [saving, setSaving] = useState(false);

  const LANGS = [
    { code: 'en' as const, name: 'English', native: 'English', flag: '🇬🇧', sub: 'Continue in English' },
    { code: 'sw' as const, name: 'Kiswahili', native: 'Kiswahili', flag: '🇹🇿', sub: 'Endelea kwa Kiswahili' },
  ];

  const pickLanguage = async (code: 'en' | 'sw') => {
    setSaving(true);
    try {
      // 1) Apply immediately so the next screen (Home) renders in this language
      await setLanguage(code);
      // 2) Save to backend
      if (user?.id) {
        try {
          const res = await usersApi.updateMe({ preferredLanguage: code });
          if (res?.data?.data) dispatch(setUser(res.data.data));
        } catch (e) {
          // Non-fatal — local change already applied
          console.log('[choose-language] backend save failed:', e);
        }
      }
      // 3) Go to home
      router.replace('/(tabs)/home' as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="globe-outline" size={40} color={theme.colors.primary} />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('auth.chooseLanguage')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('auth.chooseLanguageSubtitle', { defaultValue: 'Pick the language you want to use' })}
        </Text>
      </View>

      <View style={styles.list}>
        {LANGS.map((lang) => {
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
              disabled={saving}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: theme.colors.text }]}>{lang.name}</Text>
                <Text style={[styles.langNative, { color: theme.colors.textSecondary }]}>
                  {lang.sub}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={26} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {saving && (
        <View style={styles.saving}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home' as any)}
          disabled={saving}
        >
          <Text style={[styles.skip, { color: theme.colors.textSecondary }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', maxWidth: 320 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 12, gap: 14,
  },
  flag: { fontSize: 36 },
  langName: { fontSize: 16, fontWeight: '700' },
  langNative: { fontSize: 12, marginTop: 2 },
  saving: { alignItems: 'center', marginTop: 12 },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 24 },
  skip: { fontSize: 14, fontWeight: '500' },
});
