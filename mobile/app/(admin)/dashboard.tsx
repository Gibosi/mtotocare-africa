import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { adminApi } from '../../src/api';
import { Card } from '../../src/components/Card';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data.data || {});
    } catch {
      setStats({});
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/welcome');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcome, { color: theme.colors.textSecondary }]}>Admin,</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{user?.fullName?.split(' ')[0] || 'Admin'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>System Statistics</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Total Users" value={stats?.totalUsers ?? '--'} color={theme.colors.primary} theme={theme} />
        <StatCard icon="heart" label="Total Children" value={stats?.totalChildren ?? '--'} color={theme.colors.success} theme={theme} />
        <StatCard icon="calendar" label="Appointments" value={stats?.totalAppointments ?? '--'} color={theme.colors.info} theme={theme} />
        <StatCard icon="medkit" label="Vaccinations" value={stats?.totalVaccinations ?? '--'} color={theme.colors.warning} theme={theme} />
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionCard icon="person-add" label="Users" onPress={() => router.push('/(admin)/users')} theme={theme} />
        <ActionCard icon="people" label="Patients" onPress={() => router.push('/admin-patients' as any)} theme={theme} />
        <ActionCard icon="business" label="Facilities" onPress={() => router.push('/(admin)/facilities')} theme={theme} />
        <ActionCard icon="document-text" label="Audit Logs" onPress={() => router.push('/(admin)/audit')} theme={theme} />
        <ActionCard icon="medkit" label="Vaccines" onPress={() => router.push('/admin-vaccines' as any)} theme={theme} />
        <ActionCard icon="settings" label="Settings" onPress={() => router.push('/admin-settings' as any)} theme={theme} />
        <ActionCard icon="sync" label="Sync Status" onPress={() => router.push('/admin-sync' as any)} theme={theme} />
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Recent Activity</Text>
      <Card>
        <View style={styles.activityRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.activityText, { color: theme.colors.textSecondary }]}>
            System running normally. All services operational.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, theme }: { icon: any; label: string; value: any; color: string; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{String(value)}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
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
  section: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activityText: { fontSize: 13, flex: 1 },
});
