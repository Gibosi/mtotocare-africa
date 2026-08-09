import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const features = [
    { icon: 'chatbubbles' as const, key: 'AI Parenting Assistant' },
    { icon: 'medkit' as const, key: 'Vaccination Tracker' },
    { icon: 'pulse' as const, key: 'Growth Monitoring' },
    { icon: 'nutrition' as const, key: 'Nutrition Guidance' },
    { icon: 'document-text' as const, key: 'Digital Health Records' },
    { icon: 'notifications' as const, key: 'Smart Reminders & Alerts' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoIcon}>
          <Ionicons name="heart" size={48} color={theme.colors.primary} />
        </View>
        <View style={styles.brandContainer}>
          <Text style={[styles.brandText, { color: theme.colors.primary }]}>
            MTOTOCARE
          </Text>
          <Text style={[styles.brandText, { color: theme.colors.primary }]}>
            AFRICA
          </Text>
        </View>
      </View>

      {/* Tagline */}
      <View style={styles.taglineSection}>
        <Text style={[styles.h3, { color: theme.colors.primary, textAlign: 'center' }]}>
          AI-Powered Child Health
        </Text>
        <Text style={[styles.h3, { color: theme.colors.primary, textAlign: 'center' }]}>
          & Parenting Platform
        </Text>

        <View style={styles.divider} />

        <Text style={[styles.h4, { color: theme.colors.text, textAlign: 'center' }]}>
          Healthy Children.
        </Text>
        <Text style={[styles.h4, { color: theme.colors.text, textAlign: 'center' }]}>
          Smarter Healthcare.
        </Text>
        <Text style={[styles.h4, { color: theme.colors.text, textAlign: 'center' }]}>
          Stronger Africa.
        </Text>
      </View>

      {/* Key Features Section */}
      <View style={[styles.featuresBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
          Key Features
        </Text>
        {features.map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Ionicons name={feature.icon} size={18} color={theme.colors.primary} />
            <Text style={[styles.body2, { color: theme.colors.text, marginLeft: 12 }]}>
              {feature.key}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.getStartedBtn, { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md }]}
        onPress={() => router.push('/(auth)/get-started')}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginBtn, { borderColor: theme.colors.primary }]}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={[styles.loginText, { color: theme.colors.primary }]}>{t('auth.login')}</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandContainer: {
    alignItems: 'flex-start',
  },
  brandText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taglineSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  featuresBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  getStartedBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 12,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
