import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { Card } from '../../src/components/Card';

const FAQ = [
  {
    q: 'How do I add a child?',
    a: 'Go to the Home tab → tap the "+" button at the bottom (long-press for Add Child), or go to Profile → tap the user icon.',
  },
  {
    q: 'How do I book an appointment?',
    a: 'From Home, tap the "+" button → choose a doctor or tap "Request any available doctor" → pick date and time → confirm.',
  },
  {
    q: 'How do I record a growth measurement?',
    a: 'Home → Growth card → "Add Measurement" button → enter weight, height, and date → save.',
  },
  {
    q: 'How do I see my child\'s vaccinations?',
    a: 'Records tab → Vaccinations. You can see what\'s completed, what\'s due, and what\'s coming up.',
  },
  {
    q: 'How do I change the app language?',
    a: 'Profile → Language → choose English or Kiswahili. The change applies immediately and is saved to your account.',
  },
  {
    q: 'What if I forget my password?',
    a: 'On the login screen, tap "Forgot password" → enter your email → we\'ll send you a reset link.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. We use industry-standard encryption and never share your child\'s health data with third parties. See our Privacy Policy for details.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. Records, growth entries, and reminders you view are cached. New entries sync when you\'re back online.',
  },
];

const CONTACT = [
  { icon: 'mail-outline', label: 'support@mtotocare.africa', action: 'mailto:support@mtotocare.africa' },
  { icon: 'call-outline', label: '+255 800 MTOTO', action: 'tel:+25580068686' },
  { icon: 'globe-outline', label: 'mtotocare.africa', action: 'https://mtotocare.africa' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>{t('profile.help')}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="help-circle" size={48} color={theme.colors.primary} />
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>How can we help?</Text>
          <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
            Find answers to common questions or contact our support team.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Frequently Asked Questions</Text>
        {FAQ.map((item, i) => (
          <Card key={i} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="chevron-forward-circle" size={18} color={theme.colors.primary} />
              <Text style={[styles.faqQ, { color: theme.colors.text }]}>{item.q}</Text>
            </View>
            <Text style={[styles.faqA, { color: theme.colors.textSecondary }]}>{item.a}</Text>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Contact Us</Text>
        {CONTACT.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.contactRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => Linking.openURL(c.action).catch(() => showError('Cannot open link'))}
            activeOpacity={0.7}
          >
            <Ionicons name={c.icon as any} size={20} color={theme.colors.primary} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>{c.label}</Text>
            <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}

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
  hero: { alignItems: 'center', padding: 24, borderRadius: 16, marginBottom: 24 },
  heroTitle: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  heroSub: { fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqCard: { marginBottom: 8 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  faqQ: { fontSize: 14, fontWeight: '700', flex: 1 },
  faqA: { fontSize: 13, lineHeight: 18, marginLeft: 24 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12,
  },
  contactText: { fontSize: 14, fontWeight: '500', flex: 1 },
});
