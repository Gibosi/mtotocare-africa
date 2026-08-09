import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { adminApi } from '../../src/api';
import { AuditLog } from '../../src/types';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { formatDate, formatTime } from '../../src/utils/date';

export default function AdminAuditScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.getAuditLogs();
      setLogs(res.data.data?.content || []);
      setFiltered(res.data.data?.content || []);
    } catch {
      setLogs([]);
      setFiltered([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(logs);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(logs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      (l.userEmail || '').toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q)
    ));
  }, [search, logs]);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('REGISTER')) return theme.colors.success;
    if (action.includes('DELETE') || action.includes('DEACTIVATE')) return theme.colors.error;
    if (action.includes('UPDATE') || action.includes('LOGIN')) return theme.colors.info;
    return theme.colors.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Audit Logs</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{filtered.length} entries</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search logs..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="document-text-outline" title="No logs" message="Audit logs will appear here" />
        ) : (
          filtered.map(l => (
            <Card key={l.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View style={[styles.logIcon, { backgroundColor: getActionColor(l.action) + '20' }]}>
                  <Ionicons name="pulse" size={16} color={getActionColor(l.action)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logAction, { color: getActionColor(l.action) }]}>{l.action}</Text>
                  <Text style={[styles.logEntity, { color: theme.colors.textSecondary }]}>
                    {l.entityType}{l.entityId ? ` #${l.entityId}` : ''}
                  </Text>
                </View>
                <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>
                  {formatDate(l.createdAt)}{'\n'}{formatTime(l.createdAt)}
                </Text>
              </View>
              {l.userEmail && (
                <Text style={[styles.logUser, { color: theme.colors.text }]}>by {l.userEmail}</Text>
              )}
              {l.details && <Text style={[styles.logDetails, { color: theme.colors.textSecondary }]}>{l.details}</Text>}
              {l.ipAddress && <Text style={[styles.logIp, { color: theme.colors.textSecondary }]}>IP: {l.ipAddress}</Text>}
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
  subtitle: { fontSize: 13, marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  content: { padding: 16, paddingBottom: 40 },
  logCard: { marginBottom: 8 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logAction: { fontSize: 13, fontWeight: '700' },
  logEntity: { fontSize: 11, marginTop: 2 },
  logTime: { fontSize: 10, textAlign: 'right' },
  logUser: { fontSize: 12, marginTop: 6 },
  logDetails: { fontSize: 12, marginTop: 4 },
  logIp: { fontSize: 10, marginTop: 4, fontStyle: 'italic' },
});
