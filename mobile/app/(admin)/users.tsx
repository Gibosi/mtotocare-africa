import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { adminApi, usersApi } from '../../src/api';
import { User, UserRole } from '../../src/types';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { formatDate } from '../../src/utils/date';
import { useToast } from '../../src/components/Toast';

const ROLE_FILTERS: { value: UserRole | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PARENT', label: 'Parents' },
  { value: 'DOCTOR', label: 'Doctors' },
  { value: 'NURSE', label: 'Nurses' },
  { value: 'ADMIN', label: 'Admins' },
];

export default function AdminUsersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserRole | 'ALL'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll(0, 200);
      const data = res?.data?.data;
      setUsers(Array.isArray(data) ? data : (data?.content || []));
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q));
    }
    if (filter !== 'ALL') {
      list = list.filter(u => (u.roles || []).includes(filter));
    }
    setFiltered(list);
  }, [search, filter, users]);

  const toggleActive = async (u: User) => {
    try {
      if (u.active) {
        await usersApi.deactivate(u.id);
        showSuccess('User deactivated');
      } else {
        await usersApi.activate(u.id);
        showSuccess('User activated');
      }
      await load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not update user');
    }
  };

  const deleteUser = (u: User) => {
    Alert.alert(
      'Delete user',
      `Delete ${u.fullName}? This also removes their children and all related records. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.delete(u.id);
              showSuccess('User deleted');
              await load();
            } catch (e: any) {
              showError(e?.response?.data?.message || 'Could not delete user');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Manage Users</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {filtered.length} of {users.length} users
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by name or email"
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {ROLE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, {
              backgroundColor: filter === f.value ? theme.colors.primary : theme.colors.surface,
              borderColor: filter === f.value ? theme.colors.primary : theme.colors.border,
            }]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, { color: filter === f.value ? '#FFFFFF' : theme.colors.text }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="people-outline" title="No users" message="No users match your filters" />
        ) : (
          filtered.map(u => (
            <Card key={u.id} style={styles.userCard}>
              <View style={styles.userRow}>
                <View style={[styles.userAvatar, { backgroundColor: theme.colors.featureBg }]}>
                  <Ionicons name="person" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: theme.colors.text }]}>{u.fullName}</Text>
                  <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{u.email}</Text>
                  <View style={styles.rolesRow}>
                    {(u.roles || []).slice(0, 3).map(r => (
                      <View key={r} style={[styles.roleChip, { backgroundColor: theme.colors.featureBg }]}>
                        <Text style={[styles.roleText, { color: theme.colors.primary }]}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: u.active ? theme.colors.successLight : theme.colors.errorLight }]}
                  onPress={() => toggleActive(u)}
                >
                  <Text style={{ color: u.active ? theme.colors.success : theme.colors.error, fontSize: 11, fontWeight: '700' }}>
                    {u.active ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteUser(u)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.userMeta, { color: theme.colors.textSecondary }]}>
                Joined {u.createdAt ? formatDate(u.createdAt) : 'N/A'} • {u.emailVerified ? 'Verified' : 'Unverified'}
              </Text>
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
  filterRow: { maxHeight: 50, marginTop: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  userCard: { marginBottom: 8 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 14, fontWeight: '600' },
  userEmail: { fontSize: 12, marginTop: 2 },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  roleChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText: { fontSize: 10, fontWeight: '600' },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  deleteBtn: { padding: 6, marginLeft: 4 },
  userMeta: { fontSize: 11, marginTop: 8 },
});
