import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppSelector } from '../src/store/hooks';
import { vaccinationsApi } from '../src/api';
import { Vaccination, VaccinationSchedule } from '../src/types';
import { formatDate, ageInWeeks, ageInYearsAndMonths } from '../src/utils/date';
import { EmptyState } from '../src/components/EmptyState';

type RowStatus = 'COMPLETED' | 'DUE_SOON' | 'UPCOMING';

export default function VaccinationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { selectedId: childId, list: children } = useAppSelector(s => s.children);

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [tab, setTab] = useState<'schedule' | 'history'>('schedule');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const child = children.find(c => c.id === childId) || children[0];

  const load = async () => {
    try {
      const [schedRes, vaccRes] = await Promise.all([
        vaccinationsApi.getActiveSchedules().catch(() => ({ data: { data: [] as VaccinationSchedule[] } })),
        childId ? vaccinationsApi.getForChild(childId).catch(() => ({ data: { data: [] as Vaccination[] } })) : Promise.resolve({ data: { data: [] as Vaccination[] } }),
      ]);
      setSchedules(schedRes.data?.data || []);
      setVaccinations(vaccRes.data?.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [childId]);

  const onRefresh = async () => { setRefreshing(true); await load(); };

  const timeline = useMemo(() => {
    if (schedules.length === 0) return [];
    const administeredMap = new Map<string, Vaccination>();
    vaccinations.forEach(v => { if (v.vaccineCode) administeredMap.set(v.vaccineCode, v); });
    return schedules
      .slice()
      .sort((a, b) => a.recommendedAgeWeeks - b.recommendedAgeWeeks)
      .map(s => {
        const administered = administeredMap.get(s.vaccineCode);
        const childAgeWeeks = child?.dateOfBirth ? ageInWeeks(child.dateOfBirth) : 0;
        const dueAt = s.recommendedAgeWeeks;
        const diff = dueAt - childAgeWeeks;
        let status: RowStatus;
        if (administered) status = 'COMPLETED';
        else if (diff <= 4 && diff >= -52) status = 'DUE_SOON';
        else status = 'UPCOMING';
        return { schedule: s, administered, status, dueAt, diff };
      });
  }, [schedules, vaccinations, child]);

  const visible = timeline.filter(t => tab === 'schedule' ? t.status !== 'COMPLETED' : t.status === 'COMPLETED');

  const getDotColor = (status: RowStatus) => {
    if (status === 'COMPLETED') return theme.colors.success;
    if (status === 'DUE_SOON') return theme.colors.warning;
    return theme.colors.border;
  };

  const getStatusIcon = (status: RowStatus) => {
    if (status === 'COMPLETED') return 'checkmark-circle';
    if (status === 'DUE_SOON') return 'time';
    return 'ellipse-outline';
  };

  const getStatusLabel = (row: typeof timeline[number]) => {
    if (row.status === 'COMPLETED') {
      return `Completed${row.administered?.administeredAt ? ' on ' + formatDate(row.administered.administeredAt) : ''}`;
    }
    if (row.status === 'DUE_SOON') {
      if (row.diff < 0) return `${Math.abs(row.diff)} weeks overdue`;
      if (row.diff === 0) return 'Due this week';
      return `Due in ${row.diff} week${row.diff === 1 ? '' : 's'}`;
    }
    if (row.diff > 0) {
      if (row.dueAt >= 52) {
        const years = Math.floor(row.dueAt / 52);
        return `At ${years} year${years === 1 ? '' : 's'}`;
      }
      return `At ${row.dueAt} weeks`;
    }
    return 'Upcoming';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('vaccination.title')}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.childHeader}>
        <View style={[styles.childAvatar, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.childName, { color: theme.colors.text }]}>
            {child?.fullName || 'Select a child'}
          </Text>
          <Text style={[styles.childAge, { color: theme.colors.textSecondary }]}>
            {child ? `${ageInYearsAndMonths(child.dateOfBirth)} old` : 'Add a child to view schedule'}
          </Text>
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'schedule' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('schedule')}
        >
          <Text style={[styles.tabText, {
            color: tab === 'schedule' ? theme.colors.primary : theme.colors.textSecondary,
            fontWeight: tab === 'schedule' ? '600' : '400',
          }]}>
            Schedule
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, {
            color: tab === 'history' ? theme.colors.primary : theme.colors.textSecondary,
            fontWeight: tab === 'history' ? '600' : '400',
          }]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : !child ? (
          <EmptyState
            icon="person-add-outline"
            title={t('child.noChild')}
            message="Add a child to view their vaccination schedule"
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={tab === 'history' ? 'document-text-outline' : 'medkit-outline'}
            title={tab === 'history' ? 'No vaccinations recorded' : 'No upcoming vaccinations'}
            message={tab === 'history' ? 'Past vaccinations will appear here' : 'All caught up!'}
          />
        ) : (
          visible.map((row, idx) => {
            const isLast = idx === visible.length - 1;
            const dotColor = getDotColor(row.status);
            return (
              <View key={row.schedule.id} style={styles.vaccineRow}>
                <View style={styles.timeline}>
                  <View style={[styles.dot, { backgroundColor: dotColor, borderColor: dotColor }]}>
                    <Ionicons
                      name={getStatusIcon(row.status) as any}
                      size={row.status === 'UPCOMING' ? 14 : 16}
                      color={row.status === 'UPCOMING' ? theme.colors.textSecondary : '#FFFFFF'}
                    />
                  </View>
                  {!isLast && <View style={[styles.line, { backgroundColor: theme.colors.border }]} />}
                </View>
                <View style={[styles.vaccineCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={[styles.vaccineCode, { color: theme.colors.text }]}>
                    {row.schedule.vaccineName}
                  </Text>
                  <View style={styles.vaccineMetaRow}>
                    <Text style={[styles.vaccineSubCode, { color: theme.colors.textSecondary }]}>
                      {row.schedule.vaccineCode}
                    </Text>
                    <Text style={[styles.statusText, { color: dotColor, fontWeight: '600' }]}>
                      {getStatusLabel(row)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 4 },
  childHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  childAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  childName: { fontSize: 16, fontWeight: '700' },
  childAge: { fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14 },
  content: { padding: 16, paddingBottom: 40 },
  vaccineRow: { flexDirection: 'row' },
  timeline: { width: 40, alignItems: 'center' },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  line: { width: 2, flex: 1, minHeight: 40, marginTop: 2 },
  vaccineCard: { flex: 1, marginLeft: 12, marginBottom: 12, padding: 12, borderRadius: 8, borderWidth: 1 },
  vaccineCode: { fontSize: 14, fontWeight: '700' },
  vaccineSubCode: { fontSize: 12 },
  vaccineMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  statusText: { fontSize: 11 },
});
