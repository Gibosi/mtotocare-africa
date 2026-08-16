import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useAppSelector } from '../src/store/hooks';
import { allergiesApi, medicationsApi, growthApi, diagnosesApi, attachmentsApi } from '../src/api';
import { Diagnosis, Attachment } from '../src/types';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';
import { formatDate, calculateAgeInMonths } from '../src/utils/date';

type Section = 'allergies' | 'medications' | 'visits' | 'labs';

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { selectedId: childId, list: children } = useAppSelector(s => s.children);
  const child = children.find(c => c.id === childId) || children[0];

  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [visits, setVisits] = useState<Diagnosis[]>([]);
  const [labs, setLabs] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<Section>('allergies');

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    Promise.allSettled([
      allergiesApi.getForChild(child.id),
      medicationsApi.getForChild(child.id),
      diagnosesApi.getForChild(child.id),
      attachmentsApi.getForChild(child.id),
    ]).then(([a, m, d, att]) => {
      if (a.status === 'fulfilled') setAllergies(a.value.data.data || []);
      if (m.status === 'fulfilled') setMedications(m.value.data.data || []);
      if (d.status === 'fulfilled') {
        setVisits((d.value.data.data || []).slice().sort((x, y) => new Date(y.diagnosedAt).getTime() - new Date(x.diagnosedAt).getTime()));
      }
      if (att.status === 'fulfilled') {
        setLabs((att.value.data.data || []).filter(x => x.category === 'LAB_RESULT'));
      }
    }).finally(() => setLoading(false));
  }, [child?.id]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Medical Records</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        {!child ? (
          <EmptyState icon="person-add-outline" title="No child selected" message="Add a child to see medical records" />
        ) : loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <>
            <View style={styles.childInfo}>
              <View style={[styles.childAvatar, { backgroundColor: theme.colors.featureBg }]}>
                <Ionicons name="person" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.childName, { color: theme.colors.text }]}>{child.fullName}</Text>
                <Text style={[styles.childMeta, { color: theme.colors.textSecondary }]}>
                  {child.gender} • {calculateAgeInMonths(child.dateOfBirth)} months • {child.bloodGroup || 'Blood group unknown'}
                </Text>
              </View>
            </View>

            {/* Sections */}
            <View style={styles.sectionGrid}>
              {([
                { key: 'allergies', label: 'Allergies', icon: 'warning' },
                { key: 'medications', label: 'Medications', icon: 'medkit' },
                { key: 'visits', label: 'Health Visits', icon: 'thermometer' },
                { key: 'labs', label: 'Lab Results', icon: 'flask' },
              ] as { key: Section; label: string; icon: any }[]).map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => setSection(s.key)}
                >
                  <Ionicons name={s.icon as any} size={20} color={theme.colors.primary} />
                  <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {section === 'allergies' && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Allergies</Text>
                {allergies.length === 0 ? (
                  <Text style={[styles.none, { color: theme.colors.textSecondary }]}>No known allergies</Text>
                ) : (
                  allergies.map((a: any) => (
                    <Card key={a.id} style={{ marginBottom: 8 }}>
                      <View style={styles.allergyRow}>
                        <View style={[styles.sevDot, { backgroundColor: a.severity === 'CRITICAL' ? theme.colors.error : a.severity === 'SEVERE' ? theme.colors.warning : theme.colors.info }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.allergyName, { color: theme.colors.text }]}>{a.allergen}</Text>
                          <Text style={[styles.allergyReaction, { color: theme.colors.textSecondary }]}>{a.reaction}</Text>
                        </View>
                      </View>
                    </Card>
                  ))
                )}
              </View>
            )}

            {section === 'medications' && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Medications</Text>
                {medications.length === 0 ? (
                  <Text style={[styles.none, { color: theme.colors.textSecondary }]}>No active medications</Text>
                ) : (
                  medications.map((m: any) => (
                    <Card key={m.id} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={[styles.medName, { color: theme.colors.text }]}>{m.name}</Text>
                          <Text style={[styles.medDose, { color: theme.colors.textSecondary }]}>{m.dosage} • {m.frequency}</Text>
                          {m.prescribedBy && (
                            <Text style={[styles.medDose, { color: theme.colors.textSecondary, fontSize: 11 }]}>by {m.prescribedBy}</Text>
                          )}
                        </View>
                        {m.active && <View style={[styles.activeDot, { backgroundColor: theme.colors.success }]} />}
                      </View>
                    </Card>
                  ))
                )}
              </View>
            )}

            {section === 'visits' && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Health Visits</Text>
                {visits.length === 0 ? (
                  <Text style={[styles.none, { color: theme.colors.textSecondary }]}>
                    No visit records yet. These appear here once a doctor records a diagnosis.
                  </Text>
                ) : (
                  visits.map((v) => (
                    <View key={v.id} style={[styles.recordCard, { borderColor: theme.colors.border }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.recordTitle, { color: theme.colors.text }]}>{v.condition}</Text>
                        <View style={[styles.severityBadge, {
                          backgroundColor: v.severity === 'SEVERE' ? theme.colors.errorLight
                            : v.severity === 'MODERATE' ? theme.colors.warningLight : theme.colors.successLight
                        }]}>
                          <Text style={{
                            fontSize: 10, fontWeight: '700',
                            color: v.severity === 'SEVERE' ? theme.colors.error
                              : v.severity === 'MODERATE' ? theme.colors.warning : theme.colors.success
                          }}>{v.severity}</Text>
                        </View>
                      </View>
                      <Text style={[styles.recordMeta, { color: theme.colors.textSecondary }]}>
                        {formatDate(v.diagnosedAt)}{v.doctorName ? ` · Dr. ${v.doctorName}` : ''}
                      </Text>
                      {v.treatmentPlan ? (
                        <Text style={[styles.recordNote, { color: theme.colors.text }]}>{v.treatmentPlan}</Text>
                      ) : null}
                      {v.notes ? (
                        <Text style={[styles.recordNote, { color: theme.colors.textSecondary }]}>{v.notes}</Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}

            {section === 'labs' && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.colors.text }]}>Lab Results</Text>
                {labs.length === 0 ? (
                  <Text style={[styles.none, { color: theme.colors.textSecondary }]}>
                    Lab results will appear here once uploaded by your healthcare provider.
                  </Text>
                ) : (
                  labs.map((l) => (
                    <View key={l.id} style={[styles.recordCard, { borderColor: theme.colors.border }]}>
                      <Text style={[styles.recordTitle, { color: theme.colors.text }]}>
                        {l.originalFileName || l.fileName}
                      </Text>
                      {l.description ? (
                        <Text style={[styles.recordNote, { color: theme.colors.textSecondary }]}>{l.description}</Text>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            )}

            <Button
              title="Ask AI About Health"
              onPress={() => router.push('/ai-chat' as any)}
              icon={<Ionicons name="chatbubbles" size={18} color="#FFFFFF" />}
              fullWidth
              style={{ marginTop: 24 }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 4 },
  content: { padding: 16 },
  childInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  childAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 16, fontWeight: '700' },
  childMeta: { fontSize: 12, marginTop: 2 },
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  sectionCard: { flex: 1, minWidth: '47%', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '500', marginTop: 8 },
  detailSection: { marginTop: 8 },
  recordCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  recordTitle: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  recordMeta: { fontSize: 12, marginTop: 4 },
  recordNote: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  detailTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  none: { fontSize: 13, fontStyle: 'italic' },
  allergyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sevDot: { width: 12, height: 12, borderRadius: 6 },
  allergyName: { fontSize: 14, fontWeight: '600' },
  allergyReaction: { fontSize: 12, marginTop: 2 },
  medName: { fontSize: 14, fontWeight: '600' },
  medDose: { fontSize: 12, marginTop: 2 },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
});
