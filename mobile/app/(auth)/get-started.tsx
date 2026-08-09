import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';

export default function GetStartedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.illustration}>
        <Ionicons name="people" size={120} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Let's get started</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Create your account to start your parenting journey
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.colors.text }]}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  illustration: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  actions: { gap: 12, marginBottom: 24 },
  primaryBtn: { paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { fontSize: 15 },
});
