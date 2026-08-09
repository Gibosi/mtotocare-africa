import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  StatusBar, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { bookAppointment } from '../../src/store/slices/appointmentsSlice';
import { doctorsApi } from '../../src/api';
import { HealthcareWorker } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

const APPOINTMENT_TYPES = [
  { value: 'GENERAL_CHECKUP', label: 'General Checkup' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'SICK_VISIT', label: 'Sick Visit' },
  { value: 'GROWTH_MONITORING', label: 'Growth Monitoring' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
];

const MIN_LEAD_HOURS = 1;

export default function BookAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ doctorId?: string; doctorName?: string }>();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { list: children, selectedId: childIdRaw } = useAppSelector(s => s.children);
  // Fall back to the first child if none selected
  const childId = childIdRaw || children[0]?.id || null;

  const [doctors, setDoctors] = useState<HealthcareWorker[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<HealthcareWorker | null>(null);
  const [selectedType, setSelectedType] = useState('GENERAL_CHECKUP');
  const [reason, setReason] = useState('');

  const initialDate = new Date();
  initialDate.setHours(initialDate.getHours() + MIN_LEAD_HOURS, 0, 0, 0);
  const [appointmentDate, setAppointmentDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load doctors — fetch ALL (not just on-duty) so the parent can see
  // every available provider. The "Request any available doctor" button
  // will then pick one that is actually accepting new patients.
  useEffect(() => {
    let mounted = true;
    setLoadingDoctors(true);
    doctorsApi.getAll()
      .then(res => {
        if (!mounted) return;
        const list = (res.data.data || []) as HealthcareWorker[];
        setDoctors(list);
        // Auto-select if doctorId was passed in URL
        if (params.doctorId) {
          const id = Number(params.doctorId);
          const found = list.find(d => d.id === id);
          if (found) {
            console.log('[book] auto-select doctor from URL param:', found.id, found.fullName);
            setSelectedDoctor(found);
          }
        }
      })
      .catch(err => {
        console.log('[book] doctors load error:', err?.message);
        if (mounted) setDoctors([]);
      })
      .finally(() => mounted && setLoadingDoctors(false));
    return () => { mounted = false; };
  }, [params.doctorId]);

  const requestAnyDoctor = () => {
    // Prefer an on-duty doctor; fall back to the first doctor in the list.
    const onDuty = doctors.find(d => d.isOnDuty || d.acceptingNewPatients) || doctors[0];
    if (!onDuty) {
      showError('No doctors are available right now. Please try again later.');
      return;
    }
    console.log('[book] requestAnyDoctor ->', onDuty.id, onDuty.fullName);
    setSelectedDoctor(onDuty);
  };

  const onChangeDate = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'dismissed' || !picked) return;
    const next = new Date(appointmentDate);
    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    setAppointmentDate(next);
  };

  const onChangeTime = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (event.type === 'dismissed' || !picked) return;
    const next = new Date(appointmentDate);
    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    setAppointmentDate(next);
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const handleBook = async () => {
    console.log('[book] handleBook click - selectedDoctor:', selectedDoctor?.id, 'childId:', childId);
    if (!selectedDoctor) {
      showError('Please choose a doctor or tap "Request any available doctor".');
      return;
    }
    if (!childId) {
      showError('Please add a child first from the Profile tab.');
      return;
    }
    const now = Date.now();
    if (appointmentDate.getTime() - now < MIN_LEAD_HOURS * 60 * 60 * 1000) {
      showError(`Please pick a date and time at least ${MIN_LEAD_HOURS} hour(s) from now.`);
      return;
    }

    setLoading(true);
    try {
      const iso = appointmentDate.toISOString();
      await dispatch(bookAppointment({
        childId,
        doctorId: selectedDoctor.id,
        appointmentDatetime: iso,
        appointmentType: selectedType,
        reason: reason.trim() || undefined,
        durationMinutes: 30,
      })).unwrap();
      showSuccess('Your appointment has been scheduled!');
      setTimeout(() => router.replace('/appointments' as any), 1000);
    } catch (e: any) {
      showError(e?.message || 'Could not book appointment');
    } finally {
      setLoading(false);
    }
  };

  const canBook = !!selectedDoctor && !!childId;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.h1, { color: theme.colors.text }]}>Book Appointment</Text>
          <View style={{ width: 30 }} />
        </View>

        <Pressable
          onPress={requestAnyDoctor}
          android_ripple={{ color: theme.colors.primary + '20' }}
          style={({ pressed }) => [
            styles.requestCard,
            {
              backgroundColor: pressed ? theme.colors.primary + '15' : theme.colors.featureBg,
              borderColor: theme.colors.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={[styles.requestIcon, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="people" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.requestTitle, { color: theme.colors.text }]}>Request any available doctor</Text>
            <Text style={[styles.requestSub, { color: theme.colors.textSecondary }]}>
              We'll assign the next available on-duty doctor
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </Pressable>

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 18 }]}>
          Choose a Doctor <Text style={{ color: theme.colors.error }}>*</Text>
        </Text>
        {loadingDoctors ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 8 }} />
        ) : doctors.length === 0 ? (
          <Card>
            <Text style={{ color: theme.colors.textSecondary }}>
              No doctors available right now. Tap "Request any available doctor" above to be matched.
            </Text>
          </Card>
        ) : (
          <View style={styles.doctorsList}>
            {doctors.map(d => {
              const isSelected = selectedDoctor?.id === d.id;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => {
                    console.log('[book] tap doctor ->', d.id, d.fullName);
                    setSelectedDoctor(d);
                  }}
                  android_ripple={{ color: theme.colors.featureBg }}
                  style={({ pressed }) => [
                    styles.doctorCard,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.featureBg
                        : pressed ? theme.colors.featureBg : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={[styles.docAvatar, { backgroundColor: theme.colors.featureBg }]}>
                    <Ionicons name="person" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.docNameRow}>
                      <Text style={[styles.docName, { color: theme.colors.text }]}>
                        Dr. {(d.fullName || 'Doctor').replace(/^Dr\.\s*/i, '')}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={[styles.docSpec, { color: theme.colors.textSecondary }]}>
                      {d.specialization || d.workerRole}
                    </Text>
                    {d.facilityName && (
                      <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={11} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                          {d.facilityName}
                        </Text>
                      </View>
                    )}
                    {d.phoneNumber && (
                      <View style={styles.metaRow}>
                        <Ionicons name="call-outline" size={12} color={theme.colors.primary} />
                        <Text style={[styles.metaText, { color: theme.colors.primary, fontWeight: '700' }]}>
                          {d.phoneNumber}
                        </Text>
                      </View>
                    )}
                  </View>
                  {(d.isOnDuty || d.acceptingNewPatients) && (
                    <View style={[styles.onDutyBadge, { backgroundColor: theme.colors.successLight }]}>
                      <Text style={[styles.onDutyText, { color: theme.colors.success }]}>On Duty</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 18 }]}>Appointment Type</Text>
        <View style={styles.typeGrid}>
          {APPOINTMENT_TYPES.map(t => {
            const isSelected = selectedType === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setSelectedType(t.value)}
                android_ripple={{ color: theme.colors.primary + '20' }}
                style={({ pressed }) => [
                  styles.typeChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : pressed ? theme.colors.featureBg : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.typeText, { color: isSelected ? '#FFFFFF' : theme.colors.text }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 18 }]}>
          Date & Time <Text style={{ color: theme.colors.error }}>*</Text>
        </Text>
        <View style={styles.dateTimeRow}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            android_ripple={{ color: theme.colors.featureBg }}
            style={({ pressed }) => [
              styles.dateTimeBtn,
              {
                backgroundColor: pressed ? theme.colors.featureBg : theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.dateTimeHint, { color: theme.colors.textSecondary }]}>Date</Text>
              <Text style={[styles.dateTimeValue, { color: theme.colors.text }]} numberOfLines={1}>
                {fmtDate(appointmentDate)}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setShowTimePicker(true)}
            android_ripple={{ color: theme.colors.featureBg }}
            style={({ pressed }) => [
              styles.dateTimeBtn,
              {
                backgroundColor: pressed ? theme.colors.featureBg : theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.dateTimeHint, { color: theme.colors.textSecondary }]}>Time</Text>
              <Text style={[styles.dateTimeValue, { color: theme.colors.text }]} numberOfLines={1}>
                {fmtTime(appointmentDate)}
              </Text>
            </View>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={appointmentDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={appointmentDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minuteInterval={5}
            onChange={onChangeTime}
          />
        )}

        <Input
          label="Reason (optional)"
          value={reason}
          onChangeText={setReason}
          placeholder="Brief description"
          multiline
          containerStyle={{ marginTop: 8 }}
        />

        <View style={styles.cta}>
          <Button
            title="Book Appointment"
            onPress={handleBook}
            loading={loading}
            disabled={!canBook}
            fullWidth
            size="lg"
          />
          {!canBook && (
            <Text style={[styles.warn, { color: theme.colors.textSecondary }]}>
              {!selectedDoctor ? '⚠ Please select a doctor above.' : '⚠ Add a child in your profile to continue.'}
            </Text>
          )}
          {canBook && (
            <Text style={[styles.okHint, { color: theme.colors.success }]}>
              ✓ Ready to book with Dr. {(selectedDoctor?.fullName || '').replace(/^Dr\.\s*/i, '')}
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 22, fontWeight: '700' },
  requestCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1.5, marginTop: 4,
  },
  requestIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  requestTitle: { fontSize: 14, fontWeight: '700' },
  requestSub: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  doctorsList: { gap: 8 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12 },
  docAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  docNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  docName: { fontSize: 14, fontWeight: '600' },
  docSpec: { fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 11 },
  onDutyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  onDutyText: { fontSize: 10, fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  typeText: { fontSize: 12, fontWeight: '600' },
  dateTimeRow: { flexDirection: 'row', gap: 8 },
  dateTimeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1 },
  dateTimeHint: { fontSize: 11, fontWeight: '500' },
  dateTimeValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  cta: { marginTop: 24 },
  warn: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  okHint: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' },
});
