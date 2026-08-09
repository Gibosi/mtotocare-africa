import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useToast } from '../src/components/Toast';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppSelector } from '../src/store/hooks';
import { nutritionApi } from '../src/api';
import { NutritionPlan } from '../src/types';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';

const MEAL_ICONS: Record<string, any> = {
  BREAKFAST: 'cafe-outline',
  LUNCH: 'sunny-outline',
  DINNER: 'moon-outline',
  SNACK: 'fast-food-outline',
};

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

const TIPS = [
  'Offer a variety of colorful foods and let your child eat at their own pace.',
  'Wash hands with soap before preparing and eating food.',
  'Use clean, safe water for drinking and preparing food.',
  'Continue breastfeeding for at least 2 years alongside family foods.',
  'Avoid giving sugary drinks, candy, or salty snacks to young children.',
  'Let your child decide how much to eat — they know when they are full.',
];

export default function NutritionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t } = useLanguage();
  const { selectedId: childIdRaw, list: children } = useAppSelector(s => s.children);
  const childId = childIdRaw || children[0]?.id || null;
  const child = children.find(c => c.id === childId) || children[0];

  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = useCallback(async (showSpinner = true) => {
    if (!childId) return;
    if (showSpinner) setLoading(true);
    try {
      const res = await nutritionApi.getDaily(childId);
      setPlans((res.data.data || []).filter((p: any) => p.title && p.description));
    } catch {
      setPlans([]);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [childId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  useFocusEffect(useCallback(() => { fetchPlan(false); }, [fetchPlan]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlan(false);
    setRefreshing(false);
  };

  const generatePlan = async () => {
    if (!childId) {
      showError('Please add a child first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await nutritionApi.generateDaily(childId);
      const list = (res.data.data || []).filter((p: any) => p.title && p.description);
      setPlans(list);
      if (list.length === 0) {
        showSuccess('Plan generated but no meals were returned. Please try again.');
      } else {
        showSuccess(`${list.length} meal${list.length === 1 ? '' : 's'} generated for today.`);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Could not generate plan';
      showError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as any);
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  const tipOfTheDay = TIPS[new Date().getDate() % TIPS.length];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 4 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('nutrition.title')}</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>{today}</Text>
        </View>
        <TouchableOpacity
          onPress={generatePlan}
          disabled={generating || !childId}
          style={[
            styles.generateBtn,
            {
              backgroundColor: theme.colors.primary,
              opacity: generating || !childId ? 0.5 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {!child ? (
          <EmptyState
            icon="person-add-outline"
            title={t('child.noChild')}
            message="Add a child first to get a nutrition plan"
            action={
              <Button
                title="Add a child"
                onPress={() => router.push('/(auth)/add-your-child' as any)}
                icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
              />
            }
          />
        ) : loading && plans.length === 0 ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title={t('nutrition.todayPlan')}
            message={`Tap the ✨ button above to generate a personalized plan for ${child.fullName.split(' ')[0]}`}
            action={
              <Button
                title={t('nutrition.generatePlan')}
                onPress={generatePlan}
                loading={generating}
                icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
              />
            }
          />
        ) : (
          <>
            <View style={[styles.childBanner, { backgroundColor: theme.colors.featureBg }]}>
              <Ionicons name="restaurant" size={16} color={theme.colors.primary} />
              <Text style={[styles.childBannerText, { color: theme.colors.primary }]}>
                {plans.length} meals for {child.fullName.split(' ')[0]} ·{' '}
                {plans.reduce((s, p) => s + (p.caloriesKcal || 0), 0)} kcal total
              </Text>
            </View>

            {plans.map((p, idx) => (
              <Card key={p.id ?? `meal-${idx}-${p.mealType ?? ''}`} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={[styles.mealIcon, { backgroundColor: theme.colors.featureBg }]}>
                    <Ionicons name={MEAL_ICONS[p.mealType] || 'restaurant'} size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealType, { color: theme.colors.textSecondary }]}>
                      {MEAL_LABELS[p.mealType] || p.mealType}
                      {p.caloriesKcal ? ` · ${p.caloriesKcal} kcal` : ''}
                    </Text>
                    <Text style={[styles.mealTitle, { color: theme.colors.text }]}>{p.title}</Text>
                  </View>
                </View>
                <Text style={[styles.mealDesc, { color: theme.colors.textSecondary }]}>{p.description}</Text>
                {p.ingredients && p.ingredients.length > 0 && (
                  <View style={styles.ingredientsRow}>
                    {p.ingredients.slice(0, 5).map((ing, i) => (
                      <View key={ing ? `${ing}-${i}` : `ing-${i}`} style={[styles.ingredientChip, { backgroundColor: theme.colors.featureBg }]}>
                        <Text style={[styles.ingredientText, { color: theme.colors.primary }]}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}

            {plans[0]?.feedingFrequency && (
              <Card style={styles.feedingCard}>
                <View style={styles.feedingHeader}>
                  <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.feedingTitle, { color: theme.colors.text }]}>Feeding Schedule</Text>
                </View>
                <Text style={[styles.feedingText, { color: theme.colors.textSecondary }]}>
                  {plans[0].feedingFrequency}
                </Text>
                {plans[0].foodsToAvoid && (
                  <>
                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    <View style={styles.feedingHeader}>
                      <Ionicons name="ban-outline" size={18} color={theme.colors.error} />
                      <Text style={[styles.feedingTitle, { color: theme.colors.text }]}>Foods to Avoid</Text>
                    </View>
                    <Text style={[styles.feedingText, { color: theme.colors.textSecondary }]}>
                      {plans[0].foodsToAvoid}
                    </Text>
                  </>
                )}
              </Card>
            )}

            <Card style={[styles.tipCard, { backgroundColor: theme.colors.warningLight || theme.colors.featureBg }]}>
              <View style={styles.tipHeader}>
                <Ionicons name="bulb" size={20} color={theme.colors.warning || theme.colors.primary} />
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>Tip of the day</Text>
              </View>
              <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>{tipOfTheDay}</Text>
            </Card>

            <Button
              title="Regenerate Plan"
              onPress={generatePlan}
              loading={generating}
              variant="outline"
              icon={<Ionicons name="refresh" size={16} color={theme.colors.primary} />}
              fullWidth
              style={{ marginTop: 16 }}
            />
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  generateBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 16 },
  childBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 12, marginBottom: 12,
  },
  childBannerText: { fontSize: 12, fontWeight: '600' },
  mealCard: { marginBottom: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  mealIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mealType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  mealTitle: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  mealDesc: { fontSize: 13, lineHeight: 18 },
  ingredientsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  ingredientChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  ingredientText: { fontSize: 11, fontWeight: '500' },
  feedingCard: { marginTop: 8 },
  feedingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  feedingTitle: { fontSize: 14, fontWeight: '600' },
  feedingText: { fontSize: 13, lineHeight: 18 },
  divider: { height: 1, marginVertical: 10 },
  tipCard: { marginTop: 16 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipTitle: { fontSize: 14, fontWeight: '600' },
  tipText: { fontSize: 13, lineHeight: 18 },
});
