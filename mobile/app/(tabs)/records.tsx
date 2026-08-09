import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppSelector } from '../../src/store/hooks';
import { allergiesApi, medicationsApi, growthApi, vaccinationsApi, doctorsApi } from '../../src/api';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { HealthcareWorker } from '../../src/types';
import { OfflineBanner } from '../../src/components/OfflineBanner';

export default function RecordsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();
  const { list: children, selectedId } = useAppSelector(s => s.children);
  const child = children.find(c => c.id === selectedId) || children[0];

  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<HealthcareWorker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!child) return;
    const load = async () => {
      setLoading(true);
      try {
        const [a, m, g, v, d] = await Promise.allSettled([
          allergiesApi.getForChild(child.id),
          medicationsApi.getForChild(child.id),
          growthApi.getForChild(child.id),
          vaccinationsApi.getForChild(child.id),
          doctorsApi.getAll({ onDutyOnly: true }),
        ]);
        if (a.status === 'fulfilled') setAllergies(a.value.data.data || []);
        if (m.status === 'fulfilled') setMedications(m.value.data.data || []);
        if (g.status === 'fulfilled') setGrowth(g.value.data.data || []);
        if (v.status === 'fulfilled') setVaccinations(v.value.data.data || []);
        if (d.status === 'fulfilled') setDoctors((d.value.data.data || []) as HealthcareWorker[]);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [child?.id]);

  if (!child) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <OfflineBanner />
        <View style={styles.header}>
          <Text style={[styles.h1, { color: theme.colors.text }]}>{t('records.title')}</Text>
        </View>
        <EmptyState
          icon="folder-open-outline"
          title={t('child.noChild')}
          message="Add a child to view their health records"
          action={
            <Pressable
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: theme.colors.primary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => router.push('/(auth)/add-your-child' as any)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Add Child</Text>
            </Pressable>
          }
        />
      </View>
    );
  }

  const records = [
    { icon: 'person', label: 'Personal Information', route: `/child-records/${child.id}` as any, value: child.fullName },
    { icon: 'calendar', label: 'Birth Information', route: `/child-records/${child.id}` as any, value: child.dateOfBirth },
    { icon: 'medical', label: 'Medical History', value: 'Tap to view', route: '/medical-records' as any },
    { icon: 'warning', label: 'Allergies', value: allergies.length > 0 ? `${allergies.length} known` : 'None', route: '/medical-records' as any },
    { icon: 'medkit', label: 'Medications', value: medications.filter((m: any) => m.active).length > 0 ? `${medications.filter((m: any) => m.active).length} active` : 'None', route: '/medical-records' as any },
    { icon: 'pulse', label: 'Growth Records', value: growth.length > 0 ? `${growth.length} entries` : 'None', route: '/growth' as any },
    { icon: 'thermometer', label: 'Health Visits', value: 'View history', route: '/medical-records' as any },
    { icon: 'flask', label: 'Lab Results', value: 'View results', route: '/medical-records' as any },
    { icon: 'medkit', label: 'Vaccinations', value: vaccinations.length > 0 ? `${vaccinations.length} records` : 'View', route: '/vaccinations' as any },
  ];

  const bookWithDoctor = (d: HealthcareWorker) => {
    console.log('[records] bookWithDoctor ->', d.id, d.fullName);
    router.push({
      pathname: '/appointments/book',
      params: { doctorId: String(d.id), doctorName: d.fullName || '' },
    } as any);
  };

  const navTo = (route: string) => {
    console.log('[records] navTo ->', route);
    router.push(route as any);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <OfflineBanner />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>{t('records.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{child.fullName}</Text>
      </View>

      <View style={styles.list}>
        {records.map((r, idx) => (
          <Pressable
            key={idx}
            onPress={() => navTo(r.route)}
            android_ripple={{ color: theme.colors.featureBg }}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed ? theme.colors.featureBg : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.colors.featureBg }]}>
              <Ionicons name={r.icon as any} size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{r.label}</Text>
              {r.value && <Text style={[styles.rowValue, { color: theme.colors.textSecondary }]}>{r.value}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </Pressable>
        ))}
      </View>

      {/* Available Doctors - moved up to be more prominent */}
      {doctors.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Doctors</Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
              Tap a doctor to book an appointment
            </Text>
          </View>
          {doctors.slice(0, 5).map(d => {
            const onDuty = d.isOnDuty || d.acceptingNewPatients;
            return (
              <Pressable
                key={d.id}
                onPress={() => bookWithDoctor(d)}
                android_ripple={{ color: theme.colors.featureBg }}
                style={({ pressed }) => [
                  styles.doctorCard,
                  {
                    backgroundColor: pressed ? theme.colors.featureBg : theme.colors.surface,
                    borderColor: theme.colors.primary,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <View style={styles.doctorTopRow}>
                  <View style={[styles.docAvatar, { backgroundColor: theme.colors.featureBg }]}>
                    <Ionicons name="person" size={26} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.docNameRow}>
                      <Text style={[styles.docName, { color: theme.colors.text }]}>
                        Dr. {(d.fullName || 'Doctor').replace(/^Dr\.\s*/i, '')}
                      </Text>
                      {onDuty && (
                        <View style={[styles.onDutyBadge, { backgroundColor: theme.colors.successLight }]}>
                          <Text style={[styles.onDutyText, { color: theme.colors.success }]}>ON DUTY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.docSpec, { color: theme.colors.textSecondary }]}>
                      {d.specialization || d.workerRole}
                    </Text>
                  </View>
                </View>

                {d.facilityName && (
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {d.facilityName}
                    </Text>
                  </View>
                )}

                {d.phoneNumber ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      Linking.openURL(`tel:${d.phoneNumber}`).catch(() =>
                        showError('Phone dialer is not available on this device.')
                      );
                    }}
                    style={styles.metaRow}
                  >
                    <Ionicons name="call" size={13} color={theme.colors.primary} />
                    <Text style={[styles.metaText, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {d.phoneNumber}
                    </Text>
                    <Text style={[styles.callHint, { color: theme.colors.primary }]}>tap to call</Text>
                  </Pressable>
                ) : null}

                <View style={[styles.bookBtn, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="calendar" size={14} color="#FFFFFF" />
                  <Text style={styles.bookBtnText}>Book appointment</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {loading && (
        <Text style={[styles.loading, { color: theme.colors.textSecondary }]}>Loading latest records…</Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { marginBottom: 16 },
  h1: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1, gap: 12,
  },
  rowIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowValue: { fontSize: 12, marginTop: 2 },
  section: { marginTop: 24 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionSub: { fontSize: 12, marginTop: 2 },
  doctorCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  doctorTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  docNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  docName: { fontSize: 15, fontWeight: '700' },
  docSpec: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    flexWrap: 'wrap',
  },
  metaText: { fontSize: 12 },
  callHint: { fontSize: 10, fontStyle: 'italic', marginLeft: 4 },
  onDutyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  onDutyText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, marginTop: 12,
  },
  bookBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  addBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  loading: { fontSize: 12, textAlign: 'center', marginTop: 16 },
});
