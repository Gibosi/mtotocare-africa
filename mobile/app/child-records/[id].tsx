import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAppSelector } from '../../src/store/hooks';
import { Card } from '../../src/components/Card';
import { calculateAgeInMonths, ageInYearsAndMonths, formatDate } from '../../src/utils/date';

export default function ChildDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { list } = useAppSelector(s => s.children);
  const child = list.find(c => String(c.id) === id);

  if (!child) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Child not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>{child.fullName}</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: theme.colors.featureBg }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name={child.gender === 'FEMALE' ? 'female' : 'male'} size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{child.fullName}</Text>
          <Text style={[styles.age, { color: theme.colors.textSecondary }]}>
            {ageInYearsAndMonths(child.dateOfBirth)} old
          </Text>
        </View>

        <Text style={[styles.section, { color: theme.colors.text }]}>Personal Information</Text>
        <Card>
          <InfoRow icon="calendar" label="Date of Birth" value={formatDate(child.dateOfBirth)} />
          <InfoRow icon="person" label="Gender" value={child.gender} />
          <InfoRow icon="water" label="Blood Group" value={child.bloodGroup || 'Unknown'} />
          <InfoRow icon="fitness" label="Age" value={`${calculateAgeInMonths(child.dateOfBirth)} months`} />
        </Card>

        {child.birthWeightKg && (
          <>
            <Text style={[styles.section, { color: theme.colors.text }]}>Birth Information</Text>
            <Card>
              {child.birthWeightKg && <InfoRow icon="fitness" label="Birth Weight" value={`${child.birthWeightKg} kg`} />}
              {child.birthHeightCm && <InfoRow icon="resize" label="Birth Height" value={`${child.birthHeightCm} cm`} />}
            </Card>
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
            onPress={() => router.push('/vaccinations' as any)}
          >
            <Ionicons name="medkit" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>View Vaccinations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md }]}
            onPress={() => router.push('/growth' as any)}
          >
            <Ionicons name="pulse" size={18} color={theme.colors.text} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>View Growth</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
      <Text style={[infoStyles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  label: { flex: 1, fontSize: 13 },
  value: { fontSize: 14, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 18, fontWeight: '700' },
  content: { padding: 16 },
  heroCard: { alignItems: 'center', padding: 24, borderRadius: 16, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  age: { fontSize: 14, marginTop: 4 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
