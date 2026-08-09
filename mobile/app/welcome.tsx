import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useLanguage } from '../src/i18n/LanguageContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="heart" size={64} color={theme.colors.primary} />
        </View>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>
          MTOTOCARE
        </Text>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>
          AFRICA
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.text }]}>
          AI-Powered Child Health{'\n'}& Parenting Platform
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Healthy Children.{'\n'}Smarter Healthcare.{'\n'}Stronger Africa.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: 'medkit', label: 'Vaccination Tracker' },
          { icon: 'pulse', label: 'Growth Monitoring' },
          { icon: 'nutrition', label: 'Nutrition Guidance' },
          { icon: 'document-text', label: 'Health Records' },
          { icon: 'notifications', label: 'Smart Reminders' },
        ].map(f => (
          <View key={f.label} style={styles.featureRow}>
            <Ionicons name={f.icon as any} size={18} color={theme.colors.primary} />
            <Text style={[styles.featureLabel, { color: theme.colors.text }]}>{f.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.colors.primary, borderRadius: theme.radius.md }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.colors.primary }]}>{t('auth.login')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, paddingBottom: 32 },
  logoSection: { alignItems: 'center', marginTop: 32 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 24, fontWeight: '800', lineHeight: 28, textAlign: 'center', letterSpacing: 1 },
  tagline: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  description: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  features: { marginTop: 32, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureLabel: { fontSize: 14 },
  actions: { marginTop: 'auto', gap: 12 },
  primaryBtn: { paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, backgroundColor: 'transparent' },
  secondaryBtnText: { fontSize: 16, fontWeight: '600' },
});
