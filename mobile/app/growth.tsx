import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppSelector } from '../src/store/hooks';
import { growthApi } from '../src/api';
import { GrowthRecord } from '../src/types';
import { formatDate, ageInMonthsAt } from '../src/utils/date';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';

type Tab = 'weight' | 'height' | 'bmi';

export default function GrowthScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { selectedId: childIdRaw, list: children } = useAppSelector(s => s.children);
  const childId = childIdRaw || children[0]?.id || null;
  const child = children.find(c => c.id === childId) || children[0];

  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [tab, setTab] = useState<Tab>('weight');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const res = await growthApi.getForChild(childId);
      setRecords(
        (res.data.data || []).slice().sort(
          (a: any, b: any) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime(),
        ),
      );
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [childId]);

  // Refresh when the screen comes back into focus (e.g. after adding a measurement)
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [childId]),
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home' as any);
    }
  };

  const latest = records[records.length - 1];
  const previous = records[records.length - 2];

  const getValue = (r: GrowthRecord | undefined): number | null => {
    if (!r) return null;
    if (tab === 'weight') return r.weightKg;
    if (tab === 'height') return r.heightCm;
    if (tab === 'bmi') return r.bmi || (r.weightKg && r.heightCm ? r.weightKg / Math.pow(r.heightCm / 100, 2) : null);
    return null;
  };

  const getUnit = (): string => {
    if (tab === 'weight') return 'kg';
    if (tab === 'height') return 'cm';
    return 'kg/m²';
  };

  const renderChart = () => {
    if (records.length === 0) return null;
    const values = records.map(r => getValue(r) || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    return (
      <View style={styles.chart}>
        {records.map((r) => {
          const val = getValue(r) || 0;
          const heightPct = ((val - min) / range) * 75 + 15;
          return (
            <View key={r.id} style={styles.chartBar}>
              <View style={[styles.chartBarFill, { height: `${heightPct}%`, backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {child ? ageInMonthsAt(child.dateOfBirth, r.measurementDate) : 0}m
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('growth.title')}</Text>
          {child && (
            <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>{child.fullName}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/growth/add' as any)}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : !child ? (
          <EmptyState
            icon="person-add-outline"
            title={t('child.noChild')}
            message="Add a child first to track their growth"
            action={
              <Button
                title="Add a child"
                onPress={() => router.push('/(auth)/add-your-child' as any)}
                icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
              />
            }
          />
        ) : (
          <>
            {/* Tabs */}
            <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {(['weight', 'height', 'bmi'] as Tab[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tabBtn, tab === t && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setTab(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabLabel, { color: tab === t ? '#FFFFFF' : theme.colors.text }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Latest value */}
            <View style={styles.latestRow}>
              <View>
                <Text style={[styles.latestValue, { color: theme.colors.text }]}>
                  {latest ? `${getValue(latest)?.toFixed(1)} ${getUnit()}` : '--'}
                </Text>
                <Text style={[styles.latestLabel, { color: theme.colors.textSecondary }]}>
                  {latest ? formatDate(latest.measurementDate) : 'No data yet'}
                </Text>
              </View>
              {latest && (
                <View style={[styles.statusChip, { backgroundColor: riskColor(latest.riskLevel, theme) + '22' }]}>
                  <Text style={[styles.statusText, { color: riskColor(latest.riskLevel, theme) }]}>
                    {latest.nutritionStatus ? latest.nutritionStatus.replace(/_/g, ' ') : 'Tracked'}
                  </Text>
                </View>
              )}
            </View>

            {/* WHO Growth Assessment */}
            {latest && (latest.weightForAgeZ != null || latest.heightForAgeZ != null || latest.weightForHeightZ != null) && (
              <Card style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name="analytics-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.summaryTitle, { color: theme.colors.text, marginBottom: 0, marginLeft: 6 }]}>
                    WHO Growth Assessment
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <ZBadge label="WAZ" value={latest.weightForAgeZ} theme={theme} />
                  <ZBadge label="HAZ" value={latest.heightForAgeZ} theme={theme} />
                  <ZBadge label="WHZ" value={latest.weightForHeightZ} theme={theme} />
                  <ZBadge label="BAZ" value={latest.bmiForAgeZ} theme={theme} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  <View style={[styles.pill, { backgroundColor: riskColor(latest.riskLevel, theme) + '22' }]}>
                    <Text style={[styles.pillText, { color: riskColor(latest.riskLevel, theme) }]}>
                      {latest.riskLevel || 'UNKNOWN'} risk
                    </Text>
                  </View>
                  {latest.healthScore != null && (
                    <View style={[styles.pill, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
                      <Text style={[styles.pillText, { color: theme.colors.text }]}>Health score {latest.healthScore}/100</Text>
                    </View>
                  )}
                  {latest.growthTrend && latest.growthTrend !== 'INSUFFICIENT_DATA' && (
                    <View style={[styles.pill, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}>
                      <Text style={[styles.pillText, { color: theme.colors.text }]}>{latest.growthTrend.toLowerCase()}</Text>
                    </View>
                  )}
                </View>
                {(latest.emergencyFlag || latest.referralRecommended) && (
                  <View style={[styles.pill, { backgroundColor: theme.colors.error + '18', marginBottom: 10, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.pillText, { color: theme.colors.error }]}>
                      {latest.emergencyFlag ? '⚠ Urgent — seek care now' : 'Referral to a healthcare provider recommended'}
                    </Text>
                  </View>
                )}
                {latest.aiSummary && (
                  <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{latest.aiSummary}</Text>
                )}
              </Card>
            )}

            {/* Chart */}
            {records.length > 0 && (
              <Card style={styles.chartCard}>
                <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} trend ({getUnit()})
                </Text>
                {renderChart()}
              </Card>
            )}

            {/* Summary */}
            {latest && (
              <Card style={{ marginTop: 16 }}>
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Growth Summary</Text>
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                  Latest: {latest.weightKg} kg · {latest.heightCm} cm
                </Text>
                {previous && (
                  <Text style={[styles.summaryText, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                    Change in {tab}: {((getValue(latest) || 0) - (getValue(previous) || 0)).toFixed(2)} {getUnit()}
                  </Text>
                )}
              </Card>
            )}

            {/* Add CTA */}
            <Button
              title={t('growth.addMeasurement')}
              onPress={() => router.push('/growth/add' as any)}
              icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
              fullWidth
              size="lg"
              style={{ marginTop: 16 }}
            />

            {/* Records list */}
            {records.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Records</Text>
                {records.slice().reverse().map(r => (
                  <View key={r.id} style={[styles.recordRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View>
                      <Text style={[styles.recordDate, { color: theme.colors.text }]}>{formatDate(r.measurementDate)}</Text>
                      <Text style={[styles.recordAge, { color: theme.colors.textSecondary }]}>
                        {child ? ageInMonthsAt(child.dateOfBirth, r.measurementDate) : 0} months
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.recordVal, { color: theme.colors.text }]}>{r.weightKg} kg</Text>
                      <Text style={[styles.recordVal, { color: theme.colors.textSecondary }]}>{r.heightCm} cm</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {records.length === 0 && (
              <EmptyState
                icon="pulse-outline"
                title="No growth records yet"
                message={'Tap "Add Measurement" above to record the first entry'}
              />
            )}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const riskColor = (risk: string | undefined, theme: any): string => {
  switch (risk) {
    case 'CRITICAL': return theme.colors.error;
    case 'HIGH': return theme.colors.error;
    case 'MODERATE': return theme.colors.warning;
    case 'LOW': return theme.colors.success;
    default: return theme.colors.textSecondary;
  }
};

function ZBadge({ label, value, theme }: { label: string; value: number | undefined | null; theme: any }) {
  const abnormal = value != null && (value < -2 || value > 2);
  const color = value == null ? theme.colors.textSecondary : abnormal ? theme.colors.error : theme.colors.success;
  return (
    <View style={[zStyles.badge, { borderColor: color }]}>
      <Text style={[zStyles.badgeLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[zStyles.badgeValue, { color }]}>{value != null ? value.toFixed(2) : '—'}</Text>
    </View>
  );
}

const zStyles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 64 },
  badgeLabel: { fontSize: 10, fontWeight: '600' },
  badgeValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 16 },
  tabBar: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  latestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  latestValue: { fontSize: 36, fontWeight: '700' },
  latestLabel: { fontSize: 13, marginTop: 2 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  chartCard: { height: 220, padding: 12 },
  chartTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chart: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingBottom: 4 },
  chartBar: { flex: 1, alignItems: 'center', height: '90%', justifyContent: 'flex-end' },
  chartBarFill: { width: '70%', borderRadius: 4, marginBottom: 4 },
  chartLabel: { fontSize: 9 },
  summaryTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  summaryText: { fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginTop: 24, marginBottom: 8, textTransform: 'uppercase' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  recordDate: { fontSize: 14, fontWeight: '500' },
  recordAge: { fontSize: 12, marginTop: 2 },
  recordVal: { fontSize: 13 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  pillText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
});
