import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { facilitiesApi } from '../../src/api';
import { Facility } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';

export default function AdminFacilitiesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', region: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await facilitiesApi.getAll();
      setFacilities(res.data.data || []);
    } catch {
      setFacilities([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.city) {
      showError('Name and city are required');
      return;
    }
    setSaving(true);
    try {
      await facilitiesApi.create({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        city: form.city.trim(),
        region: form.region.trim() || undefined,
        phone: form.phone.trim() || undefined,
        facilityType: 'HEALTH_CENTER',
        isActive: true,
      });
      showSuccess('Facility added');
      setShowForm(false);
      setForm({ name: '', address: '', city: '', region: '', phone: '' });
      load();
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not create facility');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={[styles.h1, { color: theme.colors.text }]}>Facilities</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{facilities.length} total</Text>
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
          <Text style={[styles.formTitle, { color: theme.colors.text }]}>Add Facility</Text>
          <Input label="Name *" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Facility name" />
          <Input label="Address" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholder="Street address" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input label="City *" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} placeholder="City" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Region" value={form.region} onChangeText={(v) => setForm({ ...form, region: v })} placeholder="Region" />
            </View>
          </View>
          <Input label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="+255 ..." keyboardType="phone-pad" />
          <Button title="Save" onPress={submit} loading={saving} fullWidth style={{ marginTop: 8 }} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {facilities.length === 0 ? (
          <EmptyState icon="business-outline" title="No facilities" message="Add the first facility" />
        ) : (
          facilities.map(f => (
            <Card key={f.id} style={styles.facilityCard}>
              <View style={styles.facRow}>
                <View style={[styles.facIcon, { backgroundColor: theme.colors.featureBg }]}>
                  <Ionicons name="business" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.facName, { color: theme.colors.text }]}>{f.name}</Text>
                  <Text style={[styles.facMeta, { color: theme.colors.textSecondary }]}>
                    {f.facilityType} • {f.city}{f.region ? `, ${f.region}` : ''}
                  </Text>
                  {f.address && <Text style={[styles.facAddress, { color: theme.colors.textSecondary }]}>{f.address}</Text>}
                </View>
                {f.isActive && <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />}
              </View>
              {f.phone && (
                <TouchableOpacity style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={14} color={theme.colors.primary} />
                  <Text style={[styles.phone, { color: theme.colors.primary }]}>{f.phone}</Text>
                </TouchableOpacity>
              )}
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
  facilityCard: { marginBottom: 8 },
  facRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  facIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  facName: { fontSize: 14, fontWeight: '600' },
  facMeta: { fontSize: 12, marginTop: 2 },
  facAddress: { fontSize: 11, marginTop: 2 },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  phone: { fontSize: 12 },
});
