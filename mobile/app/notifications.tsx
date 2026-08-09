import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { fetchNotifications, markAsRead, markAllAsRead } from '../src/store/slices/notificationsSlice';
import { formatDate, formatTime } from '../src/utils/date';
import { EmptyState } from '../src/components/EmptyState';
import { Button } from '../src/components/Button';

const ICON_MAP: Record<string, any> = {
  VACCINATION: 'medkit',
  GROWTH: 'pulse',
  APPOINTMENT: 'calendar',
  MEDICATION: 'medkit',
  GENERAL: 'notifications',
};

const COLOR_MAP: Record<string, string> = {
  VACCINATION: 'primary',
  GROWTH: 'info',
  APPOINTMENT: 'warning',
  MEDICATION: 'success',
  GENERAL: 'textSecondary',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { list, loading, unreadCount } = useAppSelector(s => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    dispatch(markAllAsRead());
  };

  const handlePress = (id: number) => {
    dispatch(markAsRead(id));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchNotifications())} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: theme.colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {list.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="No notifications" message="You're all caught up!" />
      ) : (
        list.map(n => {
          const iconName = ICON_MAP[n.type] || 'notifications';
          const colorKey = COLOR_MAP[n.type] || 'textSecondary';
          const color = (theme.colors as any)[colorKey] || theme.colors.primary;
          return (
            <TouchableOpacity
              key={n.id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: n.read ? theme.colors.surface : theme.colors.featureBg,
                  borderColor: theme.colors.border,
                  borderLeftWidth: 4,
                  borderLeftColor: color,
                },
              ]}
              onPress={() => handlePress(n.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={iconName} size={20} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, { color: theme.colors.text }]}>{n.title}</Text>
                  {!n.read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
                </View>
                <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]}>{n.body}</Text>
                <Text style={[styles.notifTime, { color: theme.colors.textSecondary }]}>
                  {formatDate(n.createdAt)} • {formatTime(n.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 24, fontWeight: '700' },
  markAllBtn: { paddingHorizontal: 8 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  notifBody: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
});
