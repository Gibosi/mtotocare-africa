import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useAppSelector } from '../src/store/hooks';
import { Card } from '../src/components/Card';
import { useNetworkStatus, getQueueSize, clearQueue } from '../src/utils/network';
import { useLanguage } from '../src/i18n/LanguageContext';

/**
 * Offline support screen (NFR-051 to NFR-056)
 *
 * Plain-English explanation of what works without internet:
 *   - Viewing already-downloaded child records
 *   - Reading the AI library of common parenting answers
 *   - Vaccination/appointment reminders
 *   - Queueing changes that get sent when reconnected
 */
export default function OfflineScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isOnline } = useNetworkStatus();
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const size = await getQueueSize();
      if (mounted) setQueueSize(size);
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const featureItems = [
    {
      icon: 'cloud-upload' as const,
      title: t('offline.autoSyncTitle') || 'Auto-Sync',
      desc: t('offline.autoSyncDesc') || 'Anything you do while offline is saved and sent the moment you\'re back online.',
    },
    {
      icon: 'medkit' as const,
      title: t('offline.recordsTitle') || 'Health Records',
      desc: t('offline.recordsDesc') || 'View your children\'s records, growth charts, and vaccine history — even with no internet.',
    },
    {
      icon: 'chatbubbles' as const,
      title: t('offline.aiTitle') || 'AI Assistant',
      desc: t('offline.aiDesc') || 'The built-in library answers common questions about feeding, sleep, fever, and more.',
    },
    {
      icon: 'calendar' as const,
      title: t('offline.remindersTitle') || 'Reminders',
      desc: t('offline.remindersDesc') || 'Vaccine and appointment reminders still work without internet.',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>
          {t('offline.title') || 'Working without internet'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={[styles.statusCard, {
        backgroundColor: isOnline ? theme.colors.successLight : theme.colors.warningLight,
        borderColor: isOnline ? theme.colors.success : theme.colors.warning,
      }]}>
        <Ionicons
          name={isOnline ? 'cloud-done-outline' : 'cloud-offline-outline'}
          size={28}
          color={isOnline ? theme.colors.success : theme.colors.warning}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
            {isOnline
              ? (t('offline.back') || 'Back online')
              : (t('offline.title') || "You're offline")}
          </Text>
          <Text style={[styles.statusSub, { color: theme.colors.textSecondary }]}>
            {isOnline
              ? (queueSize > 0
                  ? (t('offline.queued', { count: queueSize, plural: queueSize === 1 ? '' : 's' }))
                  : (t('offline.syncing') || 'Everything is up to date.'))
              : (t('offline.subtitle') || 'MtotoCare works even without internet. Your changes will be saved and sent when you reconnect.')}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('offline.viewFeatures') || 'What works offline'}
      </Text>

      <View style={styles.features}>
        {featureItems.map((f, i) => (
          <Card key={i} style={styles.featureCard}>
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.featureBg }]}>
                <Ionicons name={f.icon} size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{f.desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {queueSize > 0 && (
        <View style={[styles.queueCard, { backgroundColor: theme.colors.featureBg, borderColor: theme.colors.primary }]}>
          <View style={styles.queueRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.queueTitle, { color: theme.colors.text }]}>
                {t('offline.queued', { count: queueSize, plural: queueSize === 1 ? '' : 's' })}
              </Text>
              <Text style={[styles.queueDesc, { color: theme.colors.textSecondary }]}>
                They'll be sent automatically when the connection is back.
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => { await clearQueue(); setQueueSize(0); }}
              style={[styles.queueBtn, { borderColor: theme.colors.primary }]}
              hitSlop={6}
            >
              <Text style={[styles.queueBtnText, { color: theme.colors.primary }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 20, fontWeight: '700' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  features: { gap: 10 },
  featureCard: {},
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  featureIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '600' },
  featureDesc: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  queueCard: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  queueRow: { flexDirection: 'row', alignItems: 'center' },
  queueTitle: { fontSize: 13, fontWeight: '700' },
  queueDesc: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  queueBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  queueBtnText: { fontSize: 11, fontWeight: '600' },
});
