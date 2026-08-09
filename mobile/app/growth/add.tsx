import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, TextInput, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { growthApi } from '../../src/api';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

const MEASUREMENT_TYPES = [
  { value: 'WEIGHT', label: 'Weight only', icon: 'barbell-outline' },
  { value: 'HEIGHT', label: 'Height only', icon: 'resize-outline' },
  { value: 'BOTH', label: 'Weight + Height', icon: 'pulse-outline' },
];

export default function AddGrowthScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const dispatch = useAppDispatch();
  const { selectedId: childIdRaw, list: children } = useAppSelector(s => s.children);
  const childId = childIdRaw || children[0]?.id || null;
  const child = children.find(c => c.id === childId) || children[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [measurementDate, setMeasurementDate] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('BOTH');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [muac, setMuac] = useState('');
  const [notes, setNotes] = useState('');
  const [showClinical, setShowClinical] = useState(false);
  const [oedema, setOedema] = useState(false);
  const [severeDehydration, setSevereDehydration] = useState(false);
  const [saving, setSaving] = useState(false);

  const onChangeDate = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'dismissed' || !picked) return;
    setMeasurementDate(picked);
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home' as any);
    }
  };

  const handleSave = async () => {
    if (!childId) {
      showError('Please add a child first.');
      return;
    }
    if (measurementDate > new Date()) {
      showError('Measurement date cannot be in the future.');
      return;
    }
    const w = weight ? parseFloat(weight) : undefined;
    const h = height ? parseFloat(height) : undefined;
    const hc = head ? parseFloat(head) : undefined;
    const mc = muac ? parseFloat(muac) : undefined;

    if (w !== undefined && (isNaN(w!) || w! <= 0 || w! > 200)) {
      showError('Weight must be between 0 and 200 kg.');
      return;
    }
    if (h !== undefined && (isNaN(h!) || h! <= 0 || h! > 250)) {
      showError('Height must be between 0 and 250 cm.');
      return;
    }
    if (hc !== undefined && (isNaN(hc!) || hc! <= 0 || hc! > 100)) {
      showError('Must be between 0 and 100 cm.');
      return;
    }
    if (w === undefined && h === undefined) {
      showError('Please enter at least weight or height.');
      return;
    }

    setSaving(true);
    try {
      // Send only the fields that are filled. Don't send 0 for missing values.
      const payload: any = {
        measurementDate: measurementDate.toISOString().substring(0, 10),
      };
      if (w !== undefined) payload.weightKg = w;
      if (h !== undefined) payload.heightCm = h;
      if (hc !== undefined) payload.headCircumferenceCm = hc;
      if (mc !== undefined) payload.muacCm = mc;
      if (notes.trim()) payload.notes = notes.trim();
      if (oedema) payload.oedema = true;
      if (severeDehydration) payload.severeDehydration = true;

      await growthApi.add(childId, payload);
      showSuccess('Growth measurement recorded');
      setTimeout(() => router.replace('/growth' as any), 1000);
    } catch (e: any) {
      showError(e?.message || 'Could not save measurement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.h1, { color: theme.colors.text }]}>Add Measurement</Text>
          <View style={{ width: 30 }} />
        </View>

        {child ? (
          <View style={[styles.childChip, { backgroundColor: theme.colors.featureBg }]}>
            <Ionicons name="person" size={14} color={theme.colors.primary} />
            <Text style={[styles.childChipText, { color: theme.colors.primary }]}>
              For {child.fullName}
            </Text>
          </View>
        ) : (
          <View style={[styles.childChip, { backgroundColor: theme.colors.errorLight || '#fee' }]}>
            <Ionicons name="warning" size={14} color={theme.colors.error} />
            <Text style={[styles.childChipText, { color: theme.colors.error }]}>
              No child selected — add one in Profile
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Measurement Date *</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.dateBtn,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 8 },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.dateBtnText, { color: theme.colors.text }]}>{fmtDate(measurementDate)}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={measurementDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(2000, 0, 1)}
            onChange={onChangeDate}
          />
        )}

        <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: 16 }]}>Measurement Type</Text>
        <View style={styles.typeRow}>
          {MEASUREMENT_TYPES.map(t => {
            const isSelected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setType(t.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={t.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {(type === 'WEIGHT' || type === 'BOTH') && (
          <Input
            label="Weight (kg) *"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 12.4"
            keyboardType="decimal-pad"
            containerStyle={{ marginTop: 12 }}
          />
        )}

        {(type === 'HEIGHT' || type === 'BOTH') && (
          <Input
            label="Height (cm) *"
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 90"
            keyboardType="decimal-pad"
            containerStyle={{ marginTop: 12 }}
          />
        )}

        <Input
          label="Head Circumference (cm) — optional"
          value={head}
          onChangeText={setHead}
          placeholder="e.g. 47"
          keyboardType="decimal-pad"
          containerStyle={{ marginTop: 12 }}
        />

        <Input
          label="MUAC — Mid-Upper Arm Circumference (cm) — optional"
          value={muac}
          onChangeText={setMuac}
          placeholder="e.g. 13.5"
          keyboardType="decimal-pad"
          containerStyle={{ marginTop: 12 }}
        />

        <TouchableOpacity
          onPress={() => setShowClinical(!showClinical)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}
          activeOpacity={0.7}
        >
          <Ionicons name={showClinical ? 'chevron-down' : 'chevron-forward'} size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginBottom: 0, marginLeft: 4 }]}>
            Clinical danger signs (healthcare workers) — optional
          </Text>
        </TouchableOpacity>

        {showClinical && (
          <View style={[styles.clinicalBox, { borderColor: theme.colors.border }]}>
            <View style={styles.switchRow}>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>Oedema present</Text>
              <Switch
                value={oedema}
                onValueChange={setOedema}
                trackColor={{ true: theme.colors.error, false: theme.colors.border }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>Signs of severe dehydration</Text>
              <Switch
                value={severeDehydration}
                onValueChange={setSevereDehydration}
                trackColor={{ true: theme.colors.error, false: theme.colors.border }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 }}>
              These flags trigger an urgent-care recommendation in the WHO growth assessment.
            </Text>
          </View>
        )}

        <Input
          label="Notes — optional"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Sick this week, slight drop"
          multiline
          containerStyle={{ marginTop: 12 }}
        />

        <Button
          title="Save Measurement"
          onPress={handleSave}
          loading={saving}
          disabled={!childId}
          fullWidth
          size="lg"
          style={{ marginTop: 20 }}
          icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 20, fontWeight: '700' },
  childChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14, alignSelf: 'flex-start', marginBottom: 12,
  },
  childChipText: { fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateBtnText: { flex: 1, fontSize: 15, fontWeight: '500' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1,
  },
  typeText: { fontSize: 12, fontWeight: '600' },
  clinicalBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
});
