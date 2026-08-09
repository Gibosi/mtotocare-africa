import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { Card } from '../../src/components/Card';

const FEATURES = [
  { icon: 'pulse', title: 'Growth Tracking', desc: 'Monitor your child\'s weight, height, and BMI with WHO-standard charts.' },
  { icon: 'medkit', title: 'Vaccination Reminders', desc: 'Never miss a vaccine. Track Tanzania EPI schedule and get timely alerts.' },
  { icon: 'calendar', title: 'Appointment Booking', desc: 'Book and manage appointments with verified healthcare workers.' },
  { icon: 'nutrition', title: 'Nutrition Guide', desc: 'Age-appropriate meal plans and feeding tips in English and Kiswahili.' },
  { icon: 'chatbubbles', title: 'AI Assistant', desc: 'Get instant answers to common parenting and health questions.' },
  { icon: 'cloud-offline', title: 'Offline Support', desc: 'Access records and key features even without internet.' },
];

const CREDITS = [
  { label: 'Built with', value: 'React Native + Spring Boot' },
  { label: 'Vaccine schedule', value: 'Tanzania EPI (WHO-aligned)' },
  { label: 'Languages', value: 'English, Kiswahili' },
  { label: 'Made for', value: 'Parents across Africa' },
];

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();
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
        <Text style={[styles.h1, { color: theme.colors.text }]}>About</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.featureBg }]}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="heart" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>MtotoCare Africa</Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            AI-Powered Child Health & Parenting Platform
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.versionText, { color: theme.colors.text }]}>Version 1.0.0</Text>
          </View>
        </View>

        <Card style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Ionicons name="globe" size={20} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Our Mission</Text>
          </View>
          <Text style={[styles.missionText, { color: theme.colors.textSecondary }]}>
            Every child in Africa deserves quality healthcare from day one. MtotoCare empowers parents
            with the tools, knowledge, and connections to keep their children healthy — from birth through
            age five and beyond.
          </Text>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 }]}>
          Key Features
        </Text>
        {FEATURES.map((f, i) => (
          <Card key={i} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.featureBg }]}>
              <Ionicons name={f.icon as any} size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{f.desc}</Text>
            </View>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 20, marginBottom: 8, paddingHorizontal: 4 }]}>
          Credits
        </Text>
        <Card>
          {CREDITS.map((c, i) => (
            <View
              key={i}
              style={[
                styles.creditRow,
                i < CREDITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
              ]}
            >
              <Text style={[styles.creditLabel, { color: theme.colors.textSecondary }]}>{c.label}</Text>
              <Text style={[styles.creditValue, { color: theme.colors.text }]}>{c.value}</Text>
            </View>
          ))}
        </Card>

        <Card style={[styles.contactCard, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="mail" size={20} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.text }]}>support@mtotocare.africa</Text>
        </Card>

        <Text style={[styles.copyright, { color: theme.colors.textSecondary }]}>
          © {new Date().getFullYear()} MtotoCare Africa. All rights reserved.
        </Text>

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
  logo: {
    width: 80, height: 80, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: '700' },
  tagline: { fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 16 },
  versionBadge: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14,
    marginTop: 12, borderWidth: 1,
  },
  versionText: { fontSize: 12, fontWeight: '600' },
  missionCard: { marginBottom: 4 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  missionText: { fontSize: 13, lineHeight: 19 },
  featureCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '700' },
  featureDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  creditLabel: { fontSize: 13 },
  creditValue: { fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, padding: 12,
  },
  contactText: { fontSize: 13, fontWeight: '600' },
  copyright: { fontSize: 11, textAlign: 'center', marginTop: 16 },
});
