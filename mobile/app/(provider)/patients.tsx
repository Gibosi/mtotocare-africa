import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { doctorsApi } from '../../src/api';
import { Child } from '../../src/types';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { calculateAgeInMonths } from '../../src/utils/date';

export default function PatientsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [patients, setPatients] = useState<Child[]>([]);
  const [filtered, setFiltered] = useState<Child[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await doctorsApi.myPatients();
      setPatients(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch {
      setPatients([]);
      setFiltered([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(patients);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      (p.bloodGroup || '').toLowerCase().includes(q)
    ));
  }, [search, patients]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={[styles.h1, { color: theme.colors.text }]}>My Patients</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by name..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No patients yet"
            message={search ? 'No patients match your search' : 'Patients will appear here once assigned'}
          />
        ) : (
          filtered.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.patientCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push({ pathname: '/provider-patient-detail', params: { id: String(p.id) } } as any)}
            >
              <View style={[styles.patientAvatar, { backgroundColor: theme.colors.featureBg }]}>
                <Ionicons name={p.gender === 'FEMALE' ? 'female' : 'male'} size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.patientName, { color: theme.colors.text }]}>{p.fullName}</Text>
                <Text style={[styles.patientMeta, { color: theme.colors.textSecondary }]}>
                  {p.gender} • {calculateAgeInMonths(p.dateOfBirth)} months {p.bloodGroup ? `• ${p.bloodGroup}` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
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
  patientCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  patientAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 14, fontWeight: '600' },
  patientMeta: { fontSize: 12, marginTop: 2 },
});
