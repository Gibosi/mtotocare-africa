import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { doctorsApi } from '../../src/api';
import { Appointment } from '../../src/types';
import { formatDate, formatTime } from '../../src/utils/date';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';

export default function ProviderAppointmentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'today' | 'upcoming' | 'past'>('today');

  const load = async () => {
    try {
      const res = await doctorsApi.myAppointments();
      setAppointments((res.data.data || []).sort((a: any, b: any) => new Date(a.appointmentDatetime).getTime() - new Date(b.appointmentDatetime).getTime()));
    } catch {
      setAppointments([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.appointmentDatetime).toDateString() === today);
  const upcoming = appointments.filter(a => new Date(a.appointmentDatetime) > new Date() && new Date(a.appointmentDatetime).toDateString() !== today);
  const past = appointments.filter(a => new Date(a.appointmentDatetime) < new Date());

  const visible = tab === 'today' ? todayAppts : tab === 'upcoming' ? upcoming : past;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>My Schedule</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'today' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setTab('today')}
        >
          <Text style={[styles.tabText, { color: tab === 'today' ? theme.colors.primary : theme.colors.textSecondary, fontWeight: tab === 'today' ? '600' : '400' }]}>
            Today ({todayAppts.length})
          </Text>
        </TouchableOpacity>
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

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {visible.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No appointments" message="No appointments in this view" />
        ) : (
          visible.map(a => (
            <Card key={a.id} style={[styles.apptCard, { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }]}>
              <View style={styles.apptHeader}>
                <View>
                  <Text style={[styles.apptTime, { color: theme.colors.text }]}>{formatTime(a.appointmentDatetime)}</Text>
                  <Text style={[styles.apptDate, { color: theme.colors.textSecondary }]}>{formatDate(a.appointmentDatetime)}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: a.status === 'CONFIRMED' ? theme.colors.successLight : a.status === 'COMPLETED' ? theme.colors.info : theme.colors.warningLight }]}>
                  <Text style={[styles.statusText, { color: a.status === 'CONFIRMED' ? theme.colors.success : a.status === 'COMPLETED' ? theme.colors.info : theme.colors.warning }]}>
                    {a.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.apptType, { color: theme.colors.text }]}>{a.appointmentType}</Text>
              {a.childName && <Text style={[styles.apptChild, { color: theme.colors.textSecondary }]}>Patient: {a.childName}</Text>}
              {a.reason && <Text style={[styles.apptReason, { color: theme.colors.text }]}>Reason: {a.reason}</Text>}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingTop: 50 },
  h1: { fontSize: 24, fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 13 },
  content: { padding: 16, paddingBottom: 40 },
  apptCard: { marginBottom: 12 },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  apptTime: { fontSize: 18, fontWeight: '700' },
  apptDate: { fontSize: 12, marginTop: 2 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  apptType: { fontSize: 14, fontWeight: '600' },
  apptChild: { fontSize: 12, marginTop: 2 },
  apptReason: { fontSize: 13, marginTop: 6, fontStyle: 'italic' },
});
