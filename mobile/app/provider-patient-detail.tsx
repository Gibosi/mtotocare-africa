import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useToast } from '../src/components/Toast';
import { childrenApi, growthApi, vaccinationsApi, allergiesApi, medicationsApi, diagnosesApi, doctorsApi } from '../src/api';
import { Child, GrowthRecord, Vaccination, Allergy, Medication, VaccinationSchedule } from '../src/types';
import { Card } from '../src/components/Card';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { formatDate, calculateAgeInMonths, todayISO } from '../src/utils/date';

type Action = 'view' | 'add_growth' | 'add_vaccination' | 'add_diagnosis' | 'add_medication' | 'add_allergy';

export default function PatientDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<Action>('view');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [c, g, v, s, a, m] = await Promise.allSettled([
          childrenApi.getById(Number(id)),
          growthApi.getForChild(Number(id)),
          vaccinationsApi.getForChild(Number(id)),
          vaccinationsApi.getActiveSchedules(),
          allergiesApi.getForChild(Number(id)),
          medicationsApi.getForChild(Number(id)),
        ]);
        if (c.status === 'fulfilled') setChild(c.value.data.data);
        if (g.status === 'fulfilled') setGrowth(g.value.data.data || []);
        if (v.status === 'fulfilled') setVaccinations(v.value.data.data || []);
        if (s.status === 'fulfilled') setSchedules(s.value.data.data || []);
        if (a.status === 'fulfilled') setAllergies(a.value.data.data || []);
        if (m.status === 'fulfilled') setMedications(m.value.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (!id) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="person-outline" size={40} color={theme.colors.textSecondary} />
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 }}>No patient selected</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
          Go back to Patients and choose someone to view.
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(provider)/patients')} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Back to Patients</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!child) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.error} />
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginTop: 12 }}>Couldn't load this patient</Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
          Check your connection and try again.
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(provider)/patients')} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Back to Patients</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Patient Detail</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={[styles.patientCard, { backgroundColor: theme.colors.featureBg }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name={child.gender === 'FEMALE' ? 'female' : 'male'} size={32} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={[styles.patientName, { color: theme.colors.text }]}>{child.fullName}</Text>
          <Text style={[styles.patientMeta, { color: theme.colors.textSecondary }]}>
            {calculateAgeInMonths(child.dateOfBirth)} months • {child.gender} • {child.bloodGroup || 'No blood group'}
          </Text>
        </View>
      </View>

      {action === 'view' && (
        <>
          <Text style={[styles.section, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <ActionBtn icon="pulse" label="Add Growth" onPress={() => setAction('add_growth')} theme={theme} />
            <ActionBtn icon="medkit" label="Add Vaccination" onPress={() => setAction('add_vaccination')} theme={theme} />
            <ActionBtn icon="document-text" label="Add Diagnosis" onPress={() => setAction('add_diagnosis')} theme={theme} />
            <ActionBtn icon="medkit" label="Prescribe" onPress={() => setAction('add_medication')} theme={theme} />
            <ActionBtn icon="warning" label="Add Allergy" onPress={() => setAction('add_allergy')} theme={theme} />
            <ActionBtn icon="chatbubbles" label="AI Insights" onPress={() => router.push('/ai-chat' as any)} theme={theme} />
          </View>

          <Text style={[styles.section, { color: theme.colors.text }]}>Growth Records ({growth.length})</Text>
          {growth.length === 0 ? (
            <Card><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>No records</Text></Card>
          ) : (
            growth.slice(-3).reverse().map(g => (
              <Card key={g.id} style={{ marginBottom: 6 }}>
                <View style={styles.recordRow}>
                  <Text style={{ color: theme.colors.text, fontSize: 13 }}>{formatDate(g.measurementDate)}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{g.weightKg} kg / {g.heightCm} cm</Text>
                </View>
              </Card>
            ))
          )}

          <Text style={[styles.section, { color: theme.colors.text }]}>Vaccinations ({vaccinations.length})</Text>
          {vaccinations.length === 0 ? (
            <Card><Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>No vaccinations</Text></Card>
          ) : (
            vaccinations.slice(0, 5).map(v => (
              <Card key={v.id} style={{ marginBottom: 6 }}>
                <View style={styles.recordRow}>
                  <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>{v.vaccineName || v.vaccineCode}</Text>
                  <Text style={{ color: v.status === 'COMPLETED' ? theme.colors.success : theme.colors.warning, fontSize: 11 }}>{v.status}</Text>
                </View>
              </Card>
            ))
          )}

          {allergies.length > 0 && (
            <>
              <Text style={[styles.section, { color: theme.colors.text }]}>Allergies ({allergies.length})</Text>
              {allergies.map(a => (
                <Card key={a.id} style={{ marginBottom: 6 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>{a.allergen}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{a.reaction} • {a.severity}</Text>
                </Card>
              ))}
            </>
          )}

          {medications.length > 0 && (
            <>
              <Text style={[styles.section, { color: theme.colors.text }]}>Medications ({medications.length})</Text>
              {medications.map(m => (
                <Card key={m.id} style={{ marginBottom: 6 }}>
                  <View style={styles.recordRow}>
                    <View>
                      <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>{m.name}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{m.dosage} • {m.frequency}</Text>
                    </View>
                    {m.active && <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />}
                  </View>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {action === 'add_growth' && <AddGrowthForm childId={child.id} onDone={() => setAction('view')} theme={theme} />}
      {action === 'add_vaccination' && <AddVaccinationForm childId={child.id} schedules={schedules} existing={vaccinations} onDone={() => setAction('view')} theme={theme} />}
      {action === 'add_diagnosis' && <AddDiagnosisForm childId={child.id} doctorId={undefined} onDone={() => setAction('view')} theme={theme} />}
      {action === 'add_medication' && <AddMedicationForm childId={child.id} onDone={() => setAction('view')} theme={theme} />}
      {action === 'add_allergy' && <AddAllergyForm childId={child.id} onDone={() => setAction('view')} theme={theme} />}
    </ScrollView>
  );
}

function ActionBtn({ icon, label, onPress, theme }: { icon: any; label: string; onPress: () => void; theme: any }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.featureBg }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AddGrowthForm({ childId, onDone, theme }: { childId: number; onDone: () => void; theme: any }) {
  const { showError, showSuccess } = useToast();
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!weight || !height) {
      showError('Please enter weight and height');
      return;
    }
    setLoading(true);
    try {
      await growthApi.add(childId, {
        measurementDate: date,
        weightKg: parseFloat(weight),
        heightCm: parseFloat(height),
      });
      showSuccess('Growth record saved');
      setTimeout(() => { onDone(); }, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.section, { color: theme.text }]}>Add Growth Record</Text>
      <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="3.2" />
      <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="50" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Cancel" variant="secondary" onPress={onDone} style={{ flex: 1 }} />
        <Button title="Save" loading={loading} onPress={submit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function AddVaccinationForm({ childId, schedules, existing, onDone, theme }: { childId: number; schedules: VaccinationSchedule[]; existing: Vaccination[]; onDone: () => void; theme: any }) {
  const { showError, showSuccess } = useToast();
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [date, setDate] = useState(todayISO());
  const [clinic, setClinic] = useState('');
  const [loading, setLoading] = useState(false);

  const available = schedules.filter(s => !existing.some(e => e.scheduleId === s.id));

  const submit = async () => {
    if (!scheduleId) {
      showError('Please choose a vaccine');
      return;
    }
    setLoading(true);
    try {
      await vaccinationsApi.record(childId, {
        scheduleId,
        administeredAt: date,
        clinicName: clinic.trim() || undefined,
      });
      showSuccess('Vaccination recorded');
      setTimeout(() => { onDone(); }, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.section, { color: theme.text }]}>Record Vaccination</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>Choose vaccine:</Text>
      {available.length === 0 ? <Text style={{ color: theme.textSecondary }}>All scheduled vaccines done</Text> : available.map(s => (
        <TouchableOpacity
          key={s.id}
          style={{
            padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 6,
            borderColor: scheduleId === s.id ? theme.primary : theme.border,
            backgroundColor: scheduleId === s.id ? theme.featureBg : theme.surface,
          }}
          onPress={() => setScheduleId(s.id)}
        >
          <Text style={{ color: theme.text, fontWeight: '500' }}>{s.vaccineName}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{s.vaccineCode}</Text>
        </TouchableOpacity>
      ))}
      <Input label="Date administered" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" containerStyle={{ marginTop: 8 }} />
      <Input label="Clinic (optional)" value={clinic} onChangeText={setClinic} placeholder="Clinic name" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Cancel" variant="secondary" onPress={onDone} style={{ flex: 1 }} />
        <Button title="Save" loading={loading} onPress={submit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function AddDiagnosisForm({ childId, doctorId, onDone, theme }: { childId: number; doctorId: number | undefined; onDone: () => void; theme: any }) {
  const { showError, showSuccess } = useToast();
  const [condition, setCondition] = useState('');
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE'>('MILD');
  const [treatment, setTreatment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!condition.trim()) {
      showError('Please enter condition');
      return;
    }
    setLoading(true);
    try {
      await diagnosesApi.add(childId, {
        condition: condition.trim(),
        severity,
        treatmentPlan: treatment.trim() || undefined,
        diagnosedAt: todayISO(),
      } as any);
      showSuccess('Diagnosis recorded');
      setTimeout(() => { onDone(); }, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.section, { color: theme.text }]}>Record Diagnosis</Text>
      <Input label="Condition" value={condition} onChangeText={setCondition} placeholder="e.g. Upper respiratory infection" />
      <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 8 }}>Severity</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['MILD', 'MODERATE', 'SEVERE'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={{
              flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center',
              borderColor: severity === s ? theme.primary : theme.border,
              backgroundColor: severity === s ? theme.featureBg : theme.surface,
            }}
            onPress={() => setSeverity(s)}
          >
            <Text style={{ color: severity === s ? theme.primary : theme.text, fontWeight: '600', fontSize: 12 }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Input label="Treatment plan (optional)" value={treatment} onChangeText={setTreatment} placeholder="Treatment notes" multiline containerStyle={{ marginTop: 8 }} />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Cancel" variant="secondary" onPress={onDone} style={{ flex: 1 }} />
        <Button title="Save" loading={loading} onPress={submit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function AddMedicationForm({ childId, onDone, theme }: { childId: number; onDone: () => void; theme: any }) {
  const { showError, showSuccess } = useToast();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      showError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await medicationsApi.add(childId, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        startDate: new Date().toISOString().split('T')[0],
        active: true,
      });
      showSuccess('Medication prescribed');
      setTimeout(() => { onDone(); }, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.section, { color: theme.text }]}>Prescribe Medication</Text>
      <Input label="Medication name" value={name} onChangeText={setName} placeholder="e.g. Amoxicillin" />
      <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 5ml" />
      <Input label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. 3 times daily" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Cancel" variant="secondary" onPress={onDone} style={{ flex: 1 }} />
        <Button title="Save" loading={loading} onPress={submit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function AddAllergyForm({ childId, onDone, theme }: { childId: number; onDone: () => void; theme: any }) {
  const { showError, showSuccess } = useToast();
  const [allergen, setAllergen] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'>('MILD');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!allergen.trim() || !reaction.trim()) {
      showError('Please fill allergen and reaction');
      return;
    }
    setLoading(true);
    try {
      await allergiesApi.add(childId, {
        allergen: allergen.trim(),
        reaction: reaction.trim(),
        severity,
      });
      showSuccess('Allergy recorded');
      setTimeout(() => { onDone(); }, 1000);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={[styles.section, { color: theme.text }]}>Add Allergy</Text>
      <Input label="Allergen" value={allergen} onChangeText={setAllergen} placeholder="e.g. Peanuts" />
      <Input label="Reaction" value={reaction} onChangeText={setReaction} placeholder="e.g. Hives, swelling" multiline />
      <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 8 }}>Severity</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1,
              borderColor: severity === s ? theme.primary : theme.border,
              backgroundColor: severity === s ? theme.featureBg : theme.surface,
            }}
            onPress={() => setSeverity(s)}
          >
            <Text style={{ color: severity === s ? theme.primary : theme.text, fontWeight: '600', fontSize: 12 }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button title="Cancel" variant="secondary" onPress={onDone} style={{ flex: 1 }} />
        <Button title="Save" loading={loading} onPress={submit} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 22, fontWeight: '700' },
  patientCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 18, fontWeight: '700' },
  patientMeta: { fontSize: 12, marginTop: 2 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '500' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
});
