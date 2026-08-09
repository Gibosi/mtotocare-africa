import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Image, StatusBar, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchChildren, selectChild } from '../../src/store/slices/childrenSlice';
import { fetchUnreadCount } from '../../src/store/slices/notificationsSlice';
import { logout } from '../../src/store/slices/authSlice';
import { ageInYearsAndMonths, ageInWeeks } from '../../src/utils/date';
import { Button } from '../../src/components/Button';
import { OfflineBanner } from '../../src/components/OfflineBanner';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const { t, language } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { list: children, selectedId, loading } = useAppSelector(s => s.children);
  const { unreadCount } = useAppSelector(s => s.notifications);

  const child = children.find(c => c.id === selectedId) || children[0];

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchUnreadCount());
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('home.goodMorning');
    if (h < 18) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  const stats = [
    { key: 'vaccination', label: t('home.vaccination'), value: child ? t('home.dueSoon') : t('home.viewRecords'), icon: 'medkit' as const, route: '/vaccinations' },
    { key: 'growth', label: t('home.growth'), value: child ? `${ageInWeeks(child.dateOfBirth)} ${language === 'sw' ? 'wiki' : 'weeks'}` : t('home.monitor'), icon: 'pulse' as const, route: '/growth' },
    { key: 'nutrition', label: t('home.nutrition'), value: language === 'sw' ? 'Mpango wa chakula' : 'Meal plan', icon: 'nutrition' as const, route: '/nutrition' },
    { key: 'ai', label: t('home.aiAssistant'), value: language === 'sw' ? 'Uliza chochote' : 'Ask anything', icon: 'chatbubbles' as const, route: '/ai-chat' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { dispatch(fetchChildren()); dispatch(fetchUnreadCount()); }}
          tintColor={theme.colors.primary}
        />
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <OfflineBanner />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeLabel, { color: theme.colors.textSecondary }]}>
            {t('common.welcome')},
          </Text>
          <Text style={[styles.welcomeName, { color: theme.colors.text }]}>
            {(user?.fullName || 'Friend').split(' ')[0]} 👋
          </Text>
        </View>
      </View>

      {/* Top-right quick action icons */}
      <View style={styles.quickIcons}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/profile/edit' as any)}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/profile/language' as any)}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Ionicons name="language-outline" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/notifications')}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            Alert.alert(t('common.logout'), t('profile.logoutConfirm'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.logout'), style: 'destructive', onPress: async () => {
                await dispatch(logout());
                router.replace('/welcome' as any);
              }},
            ]);
          }}
          hitSlop={6}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      {child ? (
        <>
          <View style={[styles.heroCard, { backgroundColor: theme.colors.featureBg }]}>
            <View style={styles.heroImage}>
              <Ionicons name="happy" size={64} color={theme.colors.primary} />
            </View>
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroText, { color: theme.colors.primaryDark }]}>{getGreeting()}</Text>
              <Text style={[styles.heroSubtext, { color: theme.colors.primaryDark }]}>
                {t('home.letsKeep', { name: child.fullName.split(' ')[0] })}
              </Text>
            </View>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.overviewHeader}>
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
                {t('home.overview')}
              </Text>
              <Text style={[styles.overviewSubtitle, { color: theme.colors.textSecondary }]}>
                {ageInYearsAndMonths(child.dateOfBirth)} old
              </Text>
            </View>

            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <TouchableOpacity
                  key={stat.key}
                  style={[styles.statCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.divider }]}
                  onPress={() => router.push(stat.route as any)}
                >
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.featureBg }]}>
                    <Ionicons name={stat.icon} size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
                  <Text style={[styles.statValue, { color: theme.colors.text }]} numberOfLines={1}>{stat.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={[styles.emptyHero, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="people" size={64} color={theme.colors.primary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('home.noChild')}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            {t('home.addFirstChild')}
          </Text>
          <Button
            title={t('home.addChild')}
            onPress={() => router.push('/(auth)/add-your-child' as any)}
            icon={<Ionicons name="add-circle" size={18} color="#FFFFFF" />}
          />
        </View>
      )}

      {children.length > 1 && (
        <View style={styles.childrenRow}>
          {children.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.childChip,
                {
                  backgroundColor: c.id === selectedId ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => dispatch(selectChild(c.id))}
            >
              <Text style={[
                styles.childChipText,
                { color: c.id === selectedId ? '#FFFFFF' : theme.colors.text },
              ]}>
                {c.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.quickActions}>
        <Button
          title={t('home.addChild')}
          onPress={() => router.push('/(auth)/add-your-child' as any)}
          icon={<Ionicons name="add-circle" size={18} color="#FFFFFF" />}
          fullWidth
        />
        <Button
          title={t('home.viewRecords')}
          onPress={() => router.push('/(tabs)/records')}
          variant="secondary"
          icon={<Ionicons name="folder-open" size={18} color={theme.colors.text} />}
          fullWidth
        />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  quickIcons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 12 },
  welcomeLabel: { fontSize: 14 },
  welcomeName: { fontSize: 22, fontWeight: '700' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  heroCard: {
    height: 180, borderRadius: 16, overflow: 'hidden',
    marginBottom: 16, position: 'relative',
  },
  heroImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { position: 'absolute', bottom: 12, left: 16, right: 16 },
  heroText: { fontSize: 16, fontWeight: '700' },
  heroSubtext: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  emptyHero: {
    padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  overviewCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  overviewHeader: { marginBottom: 12 },
  overviewTitle: { fontSize: 18, fontWeight: '700' },
  overviewSubtitle: { fontSize: 13, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%', padding: 12, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', marginBottom: 8,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statLabel: { fontSize: 11, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  childrenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  childChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  childChipText: { fontSize: 12, fontWeight: '500' },
  quickActions: { flexDirection: 'row', gap: 8 },
});
