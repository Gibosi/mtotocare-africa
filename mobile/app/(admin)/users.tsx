import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { adminApi, usersApi, facilitiesApi } from '../../src/api';
import { User, UserRole, Facility } from '../../src/types';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { formatDate } from '../../src/utils/date';
import { useToast } from '../../src/components/Toast';

const ALL_ROLES: UserRole[] = ['PARENT', 'DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'ADMIN'] as any;
const CLINICAL_ROLES = ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW'];

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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNumber: '', password: '',
    roles: ['PARENT'] as string[],
    licenseNumber: '', specialization: '', facilityId: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    facilitiesApi.getAll().then(res => setFacilities(res.data.data || [])).catch(() => setFacilities([]));
  }, []);

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

  const toggleFormRole = (role: string) => {
    setForm(f => {
      const has = f.roles.includes(role);
      return { ...f, roles: has ? f.roles.filter(r => r !== role) : [...f.roles, role] };
    });
  };

  const isClinicalForm = form.roles.some(r => CLINICAL_ROLES.includes(r));

  const submitCreate = async () => {
    if (!form.fullName.trim()) { showError('Full name is required'); return; }
    if (!form.email.trim()) { showError('Email is required'); return; }
    if (!form.password || form.password.length < 8) { showError('Password must be at least 8 characters'); return; }
    if (form.roles.length === 0) { showError('Pick at least one role'); return; }
    if (isClinicalForm && !form.licenseNumber.trim()) { showError('A license number is required for clinical roles'); return; }

    setCreating(true);
    try {
      await adminApi.createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
        confirmPassword: form.password,
        roles: form.roles,
        licenseNumber: isClinicalForm ? form.licenseNumber.trim() : undefined,
        specialization: isClinicalForm ? form.specialization.trim() || undefined : undefined,
        facilityId: isClinicalForm && form.facilityId ? Number(form.facilityId) : undefined,
      } as any);
      showSuccess('User created');
      setShowCreate(false);
      setForm({ fullName: '', email: '', phoneNumber: '', password: '', roles: ['PARENT'], licenseNumber: '', specialization: '', facilityId: '' });
      await load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not create user');
    } finally {
      setCreating(false);
    }
  };

  const toggleVerified = async (u: User) => {
    if (!u.doctorId) return;
    try {
      if (u.credentialsVerified) await adminApi.unverifyDoctorCredentials(u.doctorId);
      else await adminApi.verifyDoctorCredentials(u.doctorId);
      showSuccess(u.credentialsVerified ? 'Marked as unverified' : 'Credentials verified');
      await load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not update verification status');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: theme.colors.text }]}>Manage Users</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {filtered.length} of {users.length} users
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreate(!showCreate)}
        >
          <Ionicons name={showCreate ? 'close' : 'add'} size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>{showCreate ? 'Cancel' : 'Add User'}</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <ScrollView style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Create User</Text>
          <Input label="Full name *" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} placeholder="Jane Doe" />
          <Input label="Email *" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="jane@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" value={form.phoneNumber} onChangeText={(v) => setForm({ ...form, phoneNumber: v })} placeholder="+255..." keyboardType="phone-pad" />
          <Input label="Password *" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} placeholder="At least 8 characters" secureTextEntry />

          <Text style={[styles.formLabel, { color: theme.colors.text }]}>Roles *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {ALL_ROLES.map(r => {
              const checked = form.roles.includes(r as string);
              return (
                <TouchableOpacity
                  key={r as string}
                  onPress={() => toggleFormRole(r as string)}
                  style={[styles.roleToggle, {
                    backgroundColor: checked ? theme.colors.primary : theme.colors.background,
                    borderColor: checked ? theme.colors.primary : theme.colors.border,
                  }]}
                >
                  <Text style={{ color: checked ? '#FFFFFF' : theme.colors.text, fontSize: 12, fontWeight: '600' }}>{r as string}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isClinicalForm && (
            <View style={[styles.clinicalBox, { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningLight }]}>
              <Text style={{ color: theme.colors.warning, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                Clinical role selected — a real medical license number is required. The account starts unverified.
              </Text>
              <Input label="License number *" value={form.licenseNumber} onChangeText={(v) => setForm({ ...form, licenseNumber: v })} placeholder="e.g. TZ-MED-12345" />
              <Input label="Specialization" value={form.specialization} onChangeText={(v) => setForm({ ...form, specialization: v })} placeholder="e.g. Pediatrics" />
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Primary facility</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {facilities.map(f => {
                  const checked = form.facilityId === String(f.id);
                  return (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setForm({ ...form, facilityId: checked ? '' : String(f.id) })}
                      style={[styles.roleToggle, {
                        backgroundColor: checked ? theme.colors.primary : theme.colors.background,
                        borderColor: checked ? theme.colors.primary : theme.colors.border,
                      }]}
                    >
                      <Text style={{ color: checked ? '#FFFFFF' : theme.colors.text, fontSize: 12 }}>{f.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <Button title="Create User" onPress={submitCreate} loading={creating} fullWidth style={{ marginTop: 8, marginBottom: 16 }} />
        </ScrollView>
      )}

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
                  {u.doctorId && (
                    <TouchableOpacity
                      onPress={() => toggleVerified(u)}
                      style={[styles.verifiedBadge, {
                        backgroundColor: u.credentialsVerified ? theme.colors.successLight : theme.colors.warningLight,
                      }]}
                    >
                      <Text style={{ color: u.credentialsVerified ? theme.colors.success : theme.colors.warning, fontSize: 11, fontWeight: '700' }}>
                        {u.credentialsVerified ? '✓ Credentials verified' : '⚠ Unverified — tap to verify'}
                      </Text>
                    </TouchableOpacity>
                  )}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  formCard: { margin: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, maxHeight: 520 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  formLabel: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 6 },
  roleToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  clinicalBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4, marginBottom: 8 },
  verifiedBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
});
