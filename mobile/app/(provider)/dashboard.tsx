import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { doctorsApi, appointmentsApi } from '../../src/api';
import { HealthcareWorker, Appointment } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { formatTime, formatDate } from '../../src/utils/date';

export default function ProviderDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [worker, setWorker] = useState<HealthcareWorker | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [w, a] = await Promise.allSettled([
        doctorsApi.getByUserId(user?.id || 0),
        appointmentsApi.getAll(),
      ]);
      if (w.status === 'fulfilled') setWorker(w.value.data.data);
      if (a.status === 'fulfilled') setAppointments(a.value.data.data || []);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const toggleOnDuty = async () => {
    if (!worker) return;
    try {
      const res = await doctorsApi.updateAvailability(!worker.isOnDuty);
      setWorker(res.data.data);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not update');
    }
  };

  const today = new Date().toDateString();
  const todaysAppts = appointments.filter(a => new Date(a.appointmentDatetime).toDateString() === today);
  const upcomingAppts = appointments.filter(a => new Date(a.appointmentDatetime) > new Date() && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')).slice(0, 5);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/welcome');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcome, { color: theme.colors.textSecondary }]}>Welcome,</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>Dr. {(user?.fullName || 'Doctor').replace(/^Dr\.\s*/i, '').split(' ')[0]}</Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* On Duty Toggle */}
      <Card style={[styles.dutyCard, { backgroundColor: worker?.isOnDuty ? theme.colors.successLight : theme.colors.warningLight }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dutyTitle, { color: theme.colors.text }]}>
            {worker?.isOnDuty ? 'You are on duty' : 'You are off duty'}
          </Text>
          <Text style={[styles.dutyDesc, { color: theme.colors.textSecondary }]}>
            {worker?.isOnDuty ? 'Accepting patient appointments' : 'Not accepting new appointments'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.dutyBtn, { backgroundColor: worker?.isOnDuty ? theme.colors.warning : theme.colors.success, borderRadius: theme.radius.md }]}
          onPress={toggleOnDuty}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
            {worker?.isOnDuty ? 'Go Off' : 'Go On'}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="calendar" label="Today" value={String(todaysAppts.length)} color={theme.colors.info} />
        <StatCard icon="people" label="Patients" value="View" color={theme.colors.primary} onPress={() => router.push('/(provider)/patients')} />
        <StatCard icon="medkit" label="Records" value="Add" color={theme.colors.success} onPress={() => router.push('/(provider)/patients')} />
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionCard icon="medkit" label="Record Vaccination" onPress={() => router.push('/(provider)/patients')} theme={theme} />
        <ActionCard icon="document-text" label="Record Diagnosis" onPress={() => router.push('/(provider)/patients')} theme={theme} />
        <ActionCard icon="medkit" label="Prescribe" onPress={() => router.push('/(provider)/patients')} theme={theme} />
        <ActionCard icon="pulse" label="Update Growth" onPress={() => router.push('/(provider)/patients')} theme={theme} />
        <ActionCard icon="calendar" label="Appointments" onPress={() => router.push('/(provider)/appointments')} theme={theme} />
        <ActionCard icon="stats-chart" label="Reports" onPress={() => showError('Coming soon')} theme={theme} />
      </View>

      {/* Today's Schedule */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming Appointments</Text>
      {upcomingAppts.length === 0 ? (
        <Card>
          <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: 16 }}>
            No upcoming appointments
          </Text>
        </Card>
      ) : (
        upcomingAppts.map(a => (
          <Card key={a.id} style={styles.apptCard}>
            <View style={styles.apptTime}>
              <Text style={[styles.apptHour, { color: theme.colors.text }]}>{formatTime(a.appointmentDatetime)}</Text>
              <Text style={[styles.apptDate, { color: theme.colors.textSecondary }]}>{formatDate(a.appointmentDatetime)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.apptType, { color: theme.colors.text }]}>{a.appointmentType}</Text>
              {a.childName && <Text style={[styles.apptChild, { color: theme.colors.textSecondary }]}>{a.childName}</Text>}
            </View>
            <View style={[styles.apptStatus, { backgroundColor: a.status === 'CONFIRMED' ? theme.colors.successLight : theme.colors.warningLight }]}>
              <Text style={[styles.apptStatusText, { color: a.status === 'CONFIRMED' ? theme.colors.success : theme.colors.warning }]}>
                {a.status}
              </Text>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, onPress }: { icon: any; label: string; value: string; color: string; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionCard({ icon, label, onPress, theme }: { icon: any; label: string; onPress: () => void; theme: any }) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.colors.featureBg }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  welcome: { fontSize: 14 },
  name: { fontSize: 22, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dutyCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dutyTitle: { fontSize: 14, fontWeight: '600' },
  dutyDesc: { fontSize: 12, marginTop: 2 },
  dutyBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  actionCard: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500' },
  apptCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  apptTime: { width: 70 },
  apptHour: { fontSize: 16, fontWeight: '700' },
  apptDate: { fontSize: 11, marginTop: 2 },
  apptType: { fontSize: 14, fontWeight: '500' },
  apptChild: { fontSize: 12, marginTop: 2 },
  apptStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  apptStatusText: { fontSize: 10, fontWeight: '700' },
});
