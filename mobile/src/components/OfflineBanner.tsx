import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useNetworkStatus, getQueueSize, clearQueue } from '../utils/network';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Friendly offline banner. NFR-051 to NFR-056: tells the user when
 * they're offline, how many of their actions are queued, and when
 * the app is syncing back to the server.
 */
export function OfflineBanner() {
  const { theme } = useTheme();
  const { isOnline } = useNetworkStatus();
  const { t } = useLanguage();
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const size = await getQueueSize();
      if (mounted) setQueueSize(size);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (isOnline && queueSize > 0) {
      setSyncing(true);
      const t = setTimeout(() => setSyncing(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isOnline, queueSize]);

  if (isOnline && queueSize === 0 && !syncing) return null;

  if (syncing) {
    return (
      <View style={[styles.bar, { backgroundColor: theme.colors.primary + '15' }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.primary, marginLeft: 8 }]}>
          {t('offline.syncing') || 'Syncing your changes...'}
        </Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.bar, { backgroundColor: theme.colors.warningLight }]}>
        <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.warning} />
        <Text style={[styles.text, { color: theme.colors.warning, flex: 1, marginLeft: 8 }]}>
          {t('offline.banner') || "You're offline. Your changes will be saved and sent when you reconnect."}
        </Text>
        {queueSize > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.warning }]}>
            <Text style={styles.badgeText}>{queueSize}</Text>
          </View>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: { fontSize: 12, fontWeight: '500' },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
