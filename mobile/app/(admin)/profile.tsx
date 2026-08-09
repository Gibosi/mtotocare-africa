import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await dispatch(logout());
        router.replace('/welcome');
      }},
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Profile</Text>
      </View>

      <View style={styles.userSection}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="shield-checkmark" size={36} color={theme.colors.primary} />
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.fullName}</Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
        <View style={styles.roleRow}>
          {user?.roles?.map(role => (
            <View key={role} style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.roleText, { color: '#FFFFFF' }]}>{role}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Admin Tools</Text>
      <Card>
        <TouchableOpacity style={styles.toolRow} onPress={() => router.push('/(admin)/users')}>
          <Ionicons name="people" size={20} color={theme.colors.primary} />
          <Text style={[styles.toolText, { color: theme.colors.text }]}>User Management</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolRow} onPress={() => router.push('/(admin)/facilities')}>
          <Ionicons name="business" size={20} color={theme.colors.primary} />
          <Text style={[styles.toolText, { color: theme.colors.text }]}>Facility Management</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolRow} onPress={() => router.push('/(admin)/audit')}>
          <Ionicons name="document-text" size={20} color={theme.colors.primary} />
          <Text style={[styles.toolText, { color: theme.colors.text }]}>Audit Logs</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolRow} onPress={() => router.push('/admin-settings' as any)}>
          <Ionicons name="settings" size={20} color={theme.colors.primary} />
          <Text style={[styles.toolText, { color: theme.colors.text }]}>System Settings</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolRow} onPress={() => router.push('/admin-sync' as any)}>
          <Ionicons name="sync" size={20} color={theme.colors.primary} />
          <Text style={[styles.toolText, { color: theme.colors.text }]}>Monitor Synchronization</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="danger"
        icon={<Ionicons name="log-out" size={18} color="#FFFFFF" />}
        fullWidth
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { marginBottom: 16 },
  h1: { fontSize: 24, fontWeight: '700' },
  userSection: { alignItems: 'center', paddingVertical: 16, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 20, fontWeight: '700' },
  userEmail: { fontSize: 13, marginTop: 2 },
  roleRow: { flexDirection: 'row', marginTop: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginHorizontal: 4 },
  roleText: { fontSize: 11, fontWeight: '600' },
  section: { fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  toolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  toolText: { flex: 1, fontSize: 14, fontWeight: '500' },
});
