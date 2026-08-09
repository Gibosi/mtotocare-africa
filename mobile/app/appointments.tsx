import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useToast } from '../src/components/Toast';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchAppointments, cancelAppointment } from '../src/store/slices/appointmentsSlice';
import { doctorsApi } from '../src/api';
import { Appointment, HealthcareWorker } from '../src/types';
import { formatDate, formatTime, daysUntil } from '../src/utils/date';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';
import { parseDate } from '../src/utils/validation';

type Tab = 'upcoming' | 'past';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector(s => s.appointments);
  const { selectedId: childId, list: children } = useAppSelector(s => s.children);
  const child = children.find(c => c.id === childId) || children[0];

  const [tab, setTab] = useState<Tab>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAppointments());
    setRefreshing(false);
  };

  const handleCancel = (a: Appointment) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => dispatch(cancelAppointment({ id: a.id })) },
    ]);
  };

  const upcoming = list.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
  const past = list.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'NO_SHOW');
  const visible = tab === 'upcoming' ? upcoming : past;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>{t('appointment.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/appointments/book' as any)} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: tab === 'upcoming' ? theme.colors.primary : theme.colors.textSecondary, fontWeight: tab === 'upcoming' ? '600' : '400' }]}>
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, { color: tab === 'past' ? theme.colors.primary : theme.colors.textSecondary, fontWeight: tab === 'past' ? '600' : '400' }]}>
            Past ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && list.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          message={tab === 'upcoming' ? 'Book a new appointment with a doctor' : 'Past appointments will appear here'}
          action={tab === 'upcoming' ? (
            <Button
              title="Book Now"
              onPress={() => router.push('/appointments/book' as any)}
              icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
            />
          ) : undefined}
        />
      ) : (
        visible.map(a => <AppointmentCard key={a.id} appointment={a} onCancel={handleCancel} />)
      )}
    </ScrollView>
  );
}

function AppointmentCard({ appointment: a, onCancel }: { appointment: Appointment; onCancel: (a: Appointment) => void }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const days = daysUntil(a.appointmentDatetime);
  const statusColor = a.status === 'CONFIRMED' ? theme.colors.success
    : a.status === 'COMPLETED' ? theme.colors.info
    : a.status === 'CANCELLED' ? theme.colors.error
    : a.status === 'NO_SHOW' ? theme.colors.error
    : theme.colors.warning;

  return (
    <Card style={[styles.appointmentCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
      <View style={styles.appointmentHeader}>
        <View>
          <Text style={[styles.appointmentType, { color: theme.colors.text }]}>{a.appointmentType}</Text>
          {a.doctorName && (
            <Text style={[styles.doctorName, { color: theme.colors.textSecondary }]}>Dr. {(a.doctorName || '').replace(/^Dr\.\s*/i, '')}</Text>
          )}
        </View>
        <View style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{a.status}</Text>
        </View>
      </View>
      <View style={styles.appointmentMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{formatDate(a.appointmentDatetime)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{formatTime(a.appointmentDatetime)}</Text>
        </View>
        {a.clinicName && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{a.clinicName}</Text>
          </View>
        )}
      </View>
      {a.reason && (
        <Text style={[styles.reason, { color: theme.colors.text }]}>Reason: {a.reason}</Text>
      )}
      {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && days >= 0 && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: theme.colors.error }]}
            onPress={() => onCancel(a)}
          >
            <Text style={[styles.cancelText, { color: theme.colors.error }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 24, fontWeight: '700' },
  addBtn: { padding: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14 },
  appointmentCard: { marginBottom: 12 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  appointmentType: { fontSize: 15, fontWeight: '600' },
  doctorName: { fontSize: 12, marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
  appointmentMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  reason: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  cancelText: { fontSize: 12, fontWeight: '600' },
});
