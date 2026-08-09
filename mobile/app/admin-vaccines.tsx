import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useToast } from '../src/components/Toast';
import { adminApi } from '../src/api';
import { VaccinationSchedule } from '../src/types';
import { Card } from '../src/components/Card';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { EmptyState } from '../src/components/EmptyState';

export default function AdminVaccinesScreen() {
  const { theme } = useTheme();
  const { showError, showSuccess } = useToast();
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vaccineCode: '', vaccineName: '', description: '',
    recommendedAgeWeeks: '', dosesRequired: '1', doseNumber: '1',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.getVaccineSchedules();
      setSchedules(res.data.data || []);
    } catch {
      setSchedules([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.vaccineCode.trim() || !form.vaccineName.trim()) {
      showError('Vaccine code and name are required');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createVaccineSchedule({
        vaccineCode: form.vaccineCode.trim(),
        vaccineName: form.vaccineName.trim(),
        description: form.description.trim() || undefined,
        recommendedAgeWeeks: form.recommendedAgeWeeks ? parseInt(form.recommendedAgeWeeks, 10) : 0,
        dosesRequired: form.dosesRequired ? parseInt(form.dosesRequired, 10) : 1,
        doseNumber: form.doseNumber ? parseInt(form.doseNumber, 10) : 1,
        active: true,
      });
      showSuccess('Vaccine schedule added');
      setShowForm(false);
      setForm({ vaccineCode: '', vaccineName: '', description: '', recommendedAgeWeeks: '', dosesRequired: '1', doseNumber: '1' });
      load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not add vaccine schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: VaccinationSchedule) => {
    try {
      if (s.active) {
        await adminApi.deactivateVaccineSchedule(s.id);
        showSuccess('Deactivated');
      } else {
        await adminApi.activateVaccineSchedule(s.id);
        showSuccess('Activated');
      }
      load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not update');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.h1, { color: theme.colors.text }]}>Vaccine Schedule</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{schedules.length} entries in the EPI catalog</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13 }}>{showForm ? 'Cancel' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Add Vaccine</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input label="Code *" value={form.vaccineCode} onChangeText={(v) => setForm({ ...form, vaccineCode: v })} placeholder="e.g. BCG" autoCapitalize="characters" />
            </View>
            <View style={{ flex: 2 }}>
              <Input label="Name *" value={form.vaccineName} onChangeText={(v) => setForm({ ...form, vaccineName: v })} placeholder="e.g. Bacillus Calmette-Guérin" />
            </View>
          </View>
          <Input label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Optional notes" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input label="Age (weeks)" value={form.recommendedAgeWeeks} onChangeText={(v) => setForm({ ...form, recommendedAgeWeeks: v })} placeholder="0" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Dose #" value={form.doseNumber} onChangeText={(v) => setForm({ ...form, doseNumber: v })} placeholder="1" keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Doses total" value={form.dosesRequired} onChangeText={(v) => setForm({ ...form, dosesRequired: v })} placeholder="1" keyboardType="number-pad" />
            </View>
          </View>
          <Button title="Save" onPress={submit} loading={saving} fullWidth style={{ marginTop: 8 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {schedules.length === 0 ? (
          <EmptyState icon="medkit-outline" title="No vaccine schedules" message="Add the first entry to the EPI catalog" />
        ) : (
          schedules
            .slice()
            .sort((a, b) => (a.recommendedAgeWeeks ?? 0) - (b.recommendedAgeWeeks ?? 0))
            .map(s => (
              <Card key={s.id} style={styles.vaxCard}>
                <View style={styles.vaxRow}>
                  <View style={[styles.vaxIcon, { backgroundColor: theme.colors.featureBg }]}>
                    <Ionicons name="medkit" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.vaxName, { color: theme.colors.text }]}>{s.vaccineName}</Text>
                    <Text style={[styles.vaxMeta, { color: theme.colors.textSecondary }]}>
                      {s.vaccineCode} • {s.recommendedAgeWeeks}wks • dose {s.doseNumber}/{s.dosesRequired}
                    </Text>
                    {s.description ? (
                      <Text style={[styles.vaxDesc, { color: theme.colors.textSecondary }]}>{s.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleBtn, { backgroundColor: s.active ? theme.colors.successLight : theme.colors.errorLight }]}
                    onPress={() => toggleActive(s)}
                  >
                    <Text style={{ color: s.active ? theme.colors.success : theme.colors.error, fontSize: 11, fontWeight: '700' }}>
                      {s.active ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  h1: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  formCard: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  content: { padding: 16, paddingTop: 0, paddingBottom: 40 },
  vaxCard: { marginBottom: 8 },
  vaxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vaxIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  vaxName: { fontSize: 14, fontWeight: '600' },
  vaxMeta: { fontSize: 12, marginTop: 2 },
  vaxDesc: { fontSize: 11, marginTop: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
});
