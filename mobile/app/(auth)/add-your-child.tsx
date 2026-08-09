import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  StatusBar, KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { addChild } from '../../src/store/slices/childrenSlice';
import { useToast } from '../../src/components/Toast';

const GENDERS: { value: 'MALE' | 'FEMALE'; label: string; icon: string }[] = [
  { value: 'MALE', label: 'Male', icon: 'male' },
  { value: 'FEMALE', label: 'Female', icon: 'female' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

// Default DOB: 1 year ago (more sensible for new babies)
const defaultDob = new Date();
defaultDob.setFullYear(defaultDob.getFullYear() - 1);
defaultDob.setHours(0, 0, 0, 0);

interface RowProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  surface: string;
  textColor: string;
  hintColor: string;
  borderColor: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
}

const TextInputRow: React.FC<RowProps> = ({
  value, onChangeText, placeholder, surface, textColor, hintColor, borderColor, keyboardType,
}) => (
  <TextInput
    style={[styles.input, { backgroundColor: surface, color: textColor, borderColor }]}
    placeholder={placeholder}
    placeholderTextColor={hintColor}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType || 'default'}
    autoCapitalize="words"
  />
);

type Gender = 'MALE' | 'FEMALE';

/**
 * Per-child fields. Each child gets their own photo, blood group,
 * weight, height — never shared with their twin. Name and gender
 * are also independent (twins can be named differently).
 */
interface ChildDraft {
  firstName: string;
  lastName: string;
  gender: Gender;
  photoUri: string | null;
  bloodGroup: string;
  birthWeight: string;
  birthHeight: string;
}

const emptyChild = (gender: Gender): ChildDraft => ({
  firstName: '',
  lastName: '',
  gender,
  photoUri: null,
  bloodGroup: 'Unknown',
  birthWeight: '',
  birthHeight: '',
});

export default function AddYourChildScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(s => s.children);

  // Date of birth is shared between twins only (real twins are born same day).
  // Everything else is per-child.
  const [dob, setDob] = useState<Date>(defaultDob);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTwin, setIsTwin] = useState(false);

  // Per-child drafts
  const [first, setFirst] = useState<ChildDraft>(emptyChild('MALE'));
  const [second, setSecond] = useState<ChildDraft>(emptyChild('FEMALE'));

  const pickPhoto = async (
    source: 'camera' | 'gallery',
    setter: (uri: string | null) => void,
  ) => {
    try {
      if (source === 'camera') {
        const camPerm = await ImagePicker.requestCameraPermissionsAsync();
        if (!camPerm.granted) {
          showError('Please allow camera access in your device settings.');
          return;
        }
      } else {
        const galPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galPerm.granted) {
          showError('Please allow photo library access in your device settings.');
          return;
        }
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] });
      if (!result.canceled && result.assets[0]) {
        setter(result.assets[0].uri);
        showSuccess('Photo added');
      }
    } catch (e: any) {
      showError(e?.message || 'Could not pick photo');
    }
  };

  const choosePhoto = (
    setter: (uri: string | null) => void,
    hasPhoto: boolean,
  ) => {
    const buttons: any[] = [
      { text: 'Take Photo', onPress: () => pickPhoto('camera', setter) },
      { text: 'Choose from Gallery', onPress: () => pickPhoto('gallery', setter) },
    ];
    if (hasPhoto) {
      buttons.push({ text: 'Remove Photo', style: 'destructive', onPress: () => setter(null) });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Add Photo', 'Choose a source', buttons);
  };

  const onChangeDate = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'dismissed' || !picked) return;
    setDob(picked);
  };

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  const validateDraft = (label: string, d: ChildDraft): string | null => {
    if (!d.firstName.trim()) return `Please enter ${label}'s first name.`;
    const w = d.birthWeight ? parseFloat(d.birthWeight) : undefined;
    if (d.birthWeight && (isNaN(w!) || w! <= 0 || w! > 20)) {
      return `${label}'s birth weight must be between 0 and 20 kg.`;
    }
    const h = d.birthHeight ? parseFloat(d.birthHeight) : undefined;
    if (d.birthHeight && (isNaN(h!) || h! <= 0 || h! > 100)) {
      return `${label}'s birth height must be between 0 and 100 cm.`;
    }
    return null;
  };

  const buildPayload = (d: ChildDraft) => {
    const w = d.birthWeight ? parseFloat(d.birthWeight) : undefined;
    const h = d.birthHeight ? parseFloat(d.birthHeight) : undefined;
    return {
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim() || undefined,
      dateOfBirth: dob.toISOString().substring(0, 10),
      gender: d.gender,
      bloodGroup: d.bloodGroup === 'Unknown' ? undefined : d.bloodGroup,
      birthWeightKg: w,
      birthHeightCm: h,
      // Photo is local-only on mobile (file:// URI) — the backend has no
      // /upload endpoint in this version, so we don't send it.
    };
  };

  const handleSave = async () => {
    if (dob >= new Date()) {
      showError('Date of birth must be in the past.');
      return;
    }
    const err1 = validateDraft(isTwin ? 'the first twin' : 'your child', first);
    if (err1) { showError(err1); return; }
    if (isTwin) {
      const err2 = validateDraft('the second twin', second);
      if (err2) { showError(err2); return; }
    }

    try {
      await dispatch(addChild(buildPayload(first))).unwrap();
      if (isTwin) {
        await dispatch(addChild(buildPayload(second))).unwrap();
      }
      showSuccess(isTwin ? 'Both twins added!' : 'Child added!');
      setTimeout(() => router.replace('/(tabs)/home' as any), 800);
    } catch (err: any) {
      showError(err?.message || 'Failed to add child');
    }
  };

  const renderChildBlock = (
    label: string,
    child: ChildDraft,
    setChild: (c: ChildDraft) => void,
  ) => {
    const update = (patch: Partial<ChildDraft>) => setChild({ ...child, ...patch });
    return (
      <View style={styles.childBlock}>
        <Text style={[styles.childBlockTitle, { color: theme.colors.primary }]}>{label}</Text>

        {/* Per-child photo */}
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={[
              styles.photoUpload,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, overflow: 'hidden' },
            ]}
            onPress={() => choosePhoto((uri) => update({ photoUri: uri }), !!child.photoUri)}
            activeOpacity={0.8}
          >
            {child.photoUri ? (
              <Image source={{ uri: child.photoUri }} style={{ width: 88, height: 88, borderRadius: 44 }} />
            ) : (
              <>
                <Ionicons name="camera" size={24} color={theme.colors.textSecondary} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 2 }}>Add photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>First Name *</Text>
        <TextInputRow
          value={child.firstName}
          onChangeText={(v) => update({ firstName: v })}
          placeholder="e.g. Asha"
          surface={theme.colors.surface}
          textColor={theme.colors.text}
          hintColor={theme.colors.textSecondary}
          borderColor={theme.colors.border}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('child.lastName')}</Text>
        <TextInputRow
          value={child.lastName}
          onChangeText={(v) => update({ lastName: v })}
          placeholder="e.g. Mwakasege"
          surface={theme.colors.surface}
          textColor={theme.colors.text}
          hintColor={theme.colors.textSecondary}
          borderColor={theme.colors.border}
        />

        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Gender *</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(g => {
            const isSelected = child.gender === g.value;
            return (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.genderBtn,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => update({ gender: g.value })}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={g.icon as any}
                  size={20}
                  color={isSelected ? '#FFFFFF' : theme.colors.text}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Per-child blood group */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Blood Group (optional)</Text>
        <View style={styles.bloodRow}>
          {BLOOD_GROUPS.map(bg => {
            const isSelected = child.bloodGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                style={[
                  styles.bloodChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => update({ bloodGroup: bg })}
              >
                <Text
                  style={[
                    styles.bloodText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary },
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Per-child weight + height */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Birth Weight (kg)</Text>
            <TextInputRow
              value={child.birthWeight}
              onChangeText={(v) => update({ birthWeight: v })}
              placeholder="3.2"
              surface={theme.colors.surface}
              textColor={theme.colors.text}
              hintColor={theme.colors.textSecondary}
              borderColor={theme.colors.border}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Birth Height (cm)</Text>
            <TextInputRow
              value={child.birthHeight}
              onChangeText={(v) => update({ birthHeight: v })}
              placeholder="50"
              surface={theme.colors.surface}
              textColor={theme.colors.text}
              hintColor={theme.colors.textSecondary}
              borderColor={theme.colors.border}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="heart" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.brandText, { color: theme.colors.primary }]}>MTOTOCARE</Text>
              <Text style={[styles.brandText, { color: theme.colors.primary }]}>AFRICA</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.colors.primary }]}>{t('child.addChild')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Tell us about your child
        </Text>

        {/* Twin toggle */}
        <TouchableOpacity
          onPress={() => setIsTwin(!isTwin)}
          activeOpacity={0.8}
          style={[
            styles.twinToggle,
            {
              backgroundColor: isTwin ? theme.colors.featureBg : theme.colors.surface,
              borderColor: isTwin ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name={isTwin ? 'checkbox' : 'square-outline'}
            size={20}
            color={isTwin ? theme.colors.primary : theme.colors.textSecondary}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.twinTitle, { color: theme.colors.text }]}>This is a twin / multiple birth</Text>
            <Text style={[styles.twinSub, { color: theme.colors.textSecondary }]}>
              {isTwin
                ? 'You can add both twins — each with their own photo, blood group, weight and height'
                : 'Tap to add two children with the same date of birth'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          {/* DOB — shared by both twins (real twins are born the same day) */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Date of Birth {isTwin ? '(shared by both twins)' : ''} *
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dobBtn,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 8 },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.dobText, { color: theme.colors.text }]}>{fmtDate(dob)}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={onChangeDate}
            />
          )}

          {/* First child block — fully independent */}
          {renderChildBlock(isTwin ? 'Twin 1 of 2' : 'Child details', first, setFirst)}

          {/* Second child block (if twin) — fully independent */}
          {isTwin && (
            <View style={[styles.twinDivider, { backgroundColor: theme.colors.border }]} />
          )}
          {isTwin && renderChildBlock('Twin 2 of 2', second, setSecond)}
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, opacity: loading ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.saveText}>{loading ? 'Saving…' : isTwin ? 'Save Both Twins' : 'Save & Continue'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 50 },
  header: { marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginRight: 8 },
  brandText: { fontSize: 14, fontWeight: '700', lineHeight: 16 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  photoRow: { alignItems: 'center', marginBottom: 8 },
  photoUpload: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  twinToggle: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 12, borderWidth: 1, marginBottom: 16,
  },
  twinTitle: { fontSize: 14, fontWeight: '600' },
  twinSub: { fontSize: 11, marginTop: 2 },
  form: { marginBottom: 16 },
  childBlock: { marginTop: 8 },
  childBlockTitle: { fontSize: 13, fontWeight: '700', marginTop: 4, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  dobBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  dobText: { flex: 1, fontSize: 15, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  genderText: { fontSize: 13, fontWeight: '600' },
  bloodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bloodChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  bloodText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 4 },
  twinDivider: { height: 1, marginVertical: 16 },
  saveBtn: {
    flexDirection: 'row', paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
