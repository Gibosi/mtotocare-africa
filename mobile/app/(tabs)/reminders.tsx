import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { vaccinationsApi } from '../../src/api';
import { formatDate, daysUntil } from '../../src/utils/date';
import { EmptyState } from '../../src/components/EmptyState';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { Button } from '../../src/components/Button';

interface Reminder {
  id: string;
  type: 'vaccination' | 'appointment' | 'growth' | 'medication';
  title: string;
  subtitle?: string;
  dueDate?: string;
  daysUntil?: number;
  icon: any;
  route: string;
  color: string;
}

export default function RemindersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { list: children, selectedId } = useAppSelector(s => s.children);
  const { list: appointments } = useAppSelector(s => s.appointments);
  const [refreshing, setRefreshing] = useState(false);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  const child = children.find(c => c.id === selectedId) || children[0];

  const load = async () => {
    if (!child) return;
    try {
      const res = await vaccinationsApi.getForChild(child.id);
      setVaccinations(res.data.data || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { load(); }, [child?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const reminders: Reminder[] = [];

  // Add upcoming/overdue vaccinations
  vaccinations.forEach(v => {
    if (v.status === 'PENDING' || v.status === 'OVERDUE') {
      const due = v.nextDoseDue || v.scheduledDate;
      if (due) {
        reminders.push({
          id: `vax-${v.id}`,
          type: 'vaccination',
          title: v.vaccineName || v.vaccineCode,
          subtitle: `Dose ${v.doseNumber || 1}`,
          dueDate: due,
          daysUntil: daysUntil(due),
          icon: 'medkit',
          route: '/vaccinations',
          color: theme.colors.warning,
        });
      }
    }
  });

  // Add appointments
  appointments.forEach(a => {
    if (a.status === 'SCHEDULED' || a.status === 'CONFIRMED') {
      reminders.push({
        id: `apt-${a.id}`,
        type: 'appointment',
        title: a.appointmentType,
        subtitle: a.doctorName || a.clinicName,
        dueDate: a.appointmentDatetime,
        daysUntil: daysUntil(a.appointmentDatetime),
        icon: 'calendar',
        route: '/appointments',
        color: theme.colors.info,
      });
    }
  });

  // Sort: overdue first, then by date
  reminders.sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));

  const upcoming = reminders.filter(r => (r.daysUntil ?? 0) >= 0);
  const overdue = reminders.filter(r => (r.daysUntil ?? 0) < 0);

  const renderReminder = (r: Reminder) => (
    <TouchableOpacity
      key={r.id}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => router.push(r.route as any)}
    >
      <View style={[styles.iconBox, { backgroundColor: r.color + '20' }]}>
        <Ionicons name={r.icon} size={24} color={r.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{r.title}</Text>
        {r.subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{r.subtitle}</Text>}
        {r.dueDate && (
          <Text style={[styles.due, { color: theme.colors.textSecondary }]}>
            {formatDate(r.dueDate)}
          </Text>
        )}
      </View>
      <View style={[styles.dueChip, { backgroundColor: (r.daysUntil ?? 0) < 0 ? theme.colors.errorLight : theme.colors.warningLight }]}>
        <Text style={[styles.dueText, { color: (r.daysUntil ?? 0) < 0 ? theme.colors.error : theme.colors.warning }]}>
          {(r.daysUntil ?? 0) < 0
            ? `${Math.abs(r.daysUntil!)}d overdue`
            : r.daysUntil === 0
              ? 'Today'
              : r.daysUntil === 1
                ? 'Tomorrow'
                : `${r.daysUntil}d left`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <OfflineBanner />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>{t('reminder.title')}</Text>
      </View>

      {!child ? (
        <EmptyState icon="notifications-off-outline" title="No child added" message="Add a child to see their reminders" />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title="All caught up!"
          message="No upcoming reminders. We'll notify you when something needs attention."
        />
      ) : (
        <>
          {overdue.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>Overdue ({overdue.length})</Text>
              {overdue.map(renderReminder)}
            </View>
          )}

          {upcoming.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming ({upcoming.length})</Text>
              {upcoming.map(renderReminder)}
            </View>
          )}

          <Button
            title="Book New Appointment"
            onPress={() => router.push('/appointments/book' as any)}
            icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
            fullWidth
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { marginBottom: 16 },
  h1: { fontSize: 24, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 2 },
  due: { fontSize: 12, marginTop: 4 },
  dueChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dueText: { fontSize: 11, fontWeight: '600' },
});
