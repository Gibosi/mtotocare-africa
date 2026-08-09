import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { Card } from '../../src/components/Card';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide when creating an account (name, email, phone), information about your child(ren) (name, date of birth, gender, health records), and device information (device ID, language preference, timezone).',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide health tracking, vaccination reminders, appointment scheduling, growth monitoring, and nutrition guidance. We never sell your personal data. We may use anonymized, aggregated data to improve our services.',
  },
  {
    title: '3. Data Storage and Security',
    body: 'Your data is stored on secure servers with industry-standard encryption (TLS in transit, AES-256 at rest). Access is restricted to authorized personnel only. We perform regular security audits.',
  },
  {
    title: '4. Sharing Your Data',
    body: 'We share your data only with healthcare providers you explicitly book appointments with. We do not share data with advertisers, insurance companies, or third-party marketers. We may disclose data if required by law.',
  },
  {
    title: '5. Your Rights',
    body: 'You have the right to access, correct, export, or delete your personal data at any time. You can do this from the Profile → Settings page, or by emailing privacy@mtotocare.africa. Deletion requests are processed within 30 days.',
  },
  {
    title: '6. Children\'s Privacy',
    body: 'We take children\'s privacy especially seriously. Profiles for children under 16 must be created and managed by a parent or legal guardian. We do not collect more data than is necessary to provide our services.',
  },
  {
    title: '7. Cookies and Tracking',
    body: 'The mobile app does not use cookies. We use local storage only for your authentication tokens and app preferences. We do not track your activity across other apps.',
  },
  {
    title: '8. International Data Transfers',
    body: 'Your data is primarily stored in data centers within East Africa. Where international transfer is necessary (e.g., for cloud backup), we use providers with adequate data protection agreements.',
  },
  {
    title: '9. Changes to This Policy',
    body: 'We may update this policy from time to time. We will notify you of significant changes via the app and email. Continued use of the app after changes indicates acceptance.',
  },
  {
    title: '10. Contact Us',
    body: 'If you have questions about this policy or our data practices, contact our Data Protection Officer at privacy@mtotocare.africa.',
  },
];

export default function PrivacyScreen() {
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
        <Text style={[styles.h1, { color: theme.colors.text }]}>{t('profile.privacy')}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Your privacy matters</Text>
          <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <Card key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: theme.colors.textSecondary }]}>{s.body}</Text>
          </Card>
        ))}

        <Card style={[styles.contactCard, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="mail" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactTitle, { color: theme.colors.text }]}>Privacy questions?</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:privacy@mtotocare.africa').catch(() => showError('Cannot open email'))}
          >
            <Text style={[styles.contactLink, { color: theme.colors.primary }]}>privacy@mtotocare.africa</Text>
          </TouchableOpacity>
        </Card>

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
  hero: { alignItems: 'center', padding: 24, borderRadius: 16, marginBottom: 16 },
  heroTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  heroSub: { fontSize: 12, marginTop: 4 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  sectionBody: { fontSize: 13, lineHeight: 19 },
  contactCard: { alignItems: 'center', padding: 16, marginTop: 12 },
  contactTitle: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  contactLink: { fontSize: 13, marginTop: 4, fontWeight: '600' },
});
