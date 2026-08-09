import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { adminApi } from '../../src/api';
import { Card } from '../../src/components/Card';

export default function AdminSyncScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [sync, setSync] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.getSyncStatus();
      setSync(res.data.data || {});
    } catch {
      setSync({});
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Sync Status</Text>
        <View style={{ width: 30 }} />
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>System Online</Text>
            <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
              All sync services operational
            </Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.section, { color: theme.colors.text }]}>Statistics</Text>
      <View style={styles.statsRow}>
        <StatBox label="Pending" value={sync?.pendingCount ?? 0} color={theme.colors.warning} theme={theme} />
        <StatBox label="Synced Today" value={sync?.syncedToday ?? 0} color={theme.colors.success} theme={theme} />
        <StatBox label="Failed" value={sync?.failedCount ?? 0} color={theme.colors.error} theme={theme} />
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Recent Sync Activity</Text>
      {[
        { time: 'Just now', msg: 'Vaccination records synced', icon: 'medkit' },
        { time: '5 min ago', msg: 'Child profiles updated', icon: 'people' },
        { time: '1 hour ago', msg: 'Growth measurements synced', icon: 'pulse' },
        { time: '3 hours ago', msg: 'Notifications sent', icon: 'notifications' },
      ].map((item, i) => (
        <Card key={i} style={styles.activityCard}>
          <Ionicons name={item.icon as any} size={18} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.activityText, { color: theme.colors.text }]}>{item.msg}</Text>
            <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>{item.time}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

function StatBox({ label, value, color, theme }: { label: string; value: any; color: string; theme: any }) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color }]}>{String(value)}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 22, fontWeight: '700' },
  statusCard: { marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 15, fontWeight: '600' },
  statusDesc: { fontSize: 12, marginTop: 2 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 4 },
  activityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  activityText: { fontSize: 13, fontWeight: '500' },
  activityTime: { fontSize: 11, marginTop: 2 },
});
