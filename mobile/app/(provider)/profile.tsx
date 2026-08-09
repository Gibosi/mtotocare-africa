import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { doctorsApi } from '../../src/api';
import { HealthcareWorker } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [worker, setWorker] = useState<HealthcareWorker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    doctorsApi.getByUserId(user.id)
      .then(res => setWorker(res.data.data))
      .catch(() => setWorker(null))
      .finally(() => setLoading(false));
  }, [user]);

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

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <>
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.featureBg }]}>
              <Ionicons name="person" size={36} color={theme.colors.primary} />
            </View>
            <Text style={[styles.userName, { color: theme.colors.text }]}>Dr. {(user?.fullName || '').replace(/^Dr\.\s*/i, '')}</Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
            <View style={styles.roleRow}>
              {user?.roles?.map(role => (
                <View key={role} style={[styles.roleBadge, { backgroundColor: theme.colors.featureBg }]}>
                  <Text style={[styles.roleText, { color: theme.colors.primary }]}>{role}</Text>
                </View>
              ))}
            </View>
          </View>

          {worker && (
            <>
              <Text style={[styles.section, { color: theme.colors.text }]}>Professional Info</Text>
              <Card>
                <InfoRow label="Role" value={worker.workerRole} theme={theme} />
                {worker.specialization && <InfoRow label="Specialization" value={worker.specialization} theme={theme} />}
                {worker.licenseNumber && <InfoRow label="License" value={worker.licenseNumber} theme={theme} />}
                {worker.qualifications && <InfoRow label="Qualifications" value={worker.qualifications} theme={theme} />}
                {worker.yearsOfExperience !== undefined && <InfoRow label="Experience" value={`${worker.yearsOfExperience} years`} theme={theme} />}
                {worker.facilityName && <InfoRow label="Facility" value={worker.facilityName} theme={theme} />}
                <InfoRow label="Status" value={worker.isOnDuty ? 'On Duty' : 'Off Duty'} theme={theme} />
              </Card>
            </>
          )}

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            icon={<Ionicons name="log-out" size={18} color="#FFFFFF" />}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500', flex: 1, textAlign: 'right' },
});
