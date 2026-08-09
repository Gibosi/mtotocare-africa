import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { adminApi } from '../../src/api';
import { SystemSettings } from '../../src/types';
import { Card } from '../../src/components/Card';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showError, showSuccess, showInfo } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      setSettings(res.data.data);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await adminApi.updateSettings({ [key]: value });
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Could not save');
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.primary} /></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.h1, { color: theme.colors.text }]}>System Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <Text style={[styles.section, { color: theme.colors.text }]}>Application</Text>
      <Card>
        <InfoRow label="App Name" value={settings.appName} theme={theme} />
        <InfoRow label="Version" value={settings.appVersion} theme={theme} />
        <InfoRow label="Max Children per Parent" value={String(settings.maxChildrenPerParent)} theme={theme} />
      </Card>

      <Text style={[styles.section, { color: theme.colors.text }]}>System Controls</Text>
      <Card>
        <ToggleRow
          label="Maintenance Mode"
          description="Disable user access during maintenance"
          value={settings.maintenanceMode}
          onChange={(v) => update('maintenanceMode', v)}
          theme={theme}
        />
        <ToggleRow
          label="Registration Enabled"
          description="Allow new users to register"
          value={settings.registrationEnabled}
          onChange={(v) => update('registrationEnabled', v)}
          theme={theme}
        />
        <ToggleRow
          label="SMS Gateway"
          description="Enable SMS notifications"
          value={settings.smsGatewayEnabled}
          onChange={(v) => update('smsGatewayEnabled', v)}
          theme={theme}
        />
        <ToggleRow
          label="Email Gateway"
          description="Enable email notifications"
          value={settings.emailGatewayEnabled}
          onChange={(v) => update('emailGatewayEnabled', v)}
          theme={theme}
        />
        <ToggleRow
          label="Push Notifications"
          description="Send push notifications to mobile apps"
          value={settings.pushNotificationsEnabled}
          onChange={(v) => update('pushNotificationsEnabled', v)}
          theme={theme}
        />
      </Card>

      <Text style={[styles.section, { color: theme.colors.text }]}>JWT Settings</Text>
      <Card>
        <InfoRow label="Access Token Expiration" value={`${Math.round(settings.jwtAccessTokenExpiration / 60000)} minutes`} theme={theme} />
        <InfoRow label="Refresh Token Expiration" value={`${Math.round(settings.jwtRefreshTokenExpiration / 86400000)} days`} theme={theme} />
      </Card>
    </ScrollView>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, description, value, onChange, theme }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void; theme: any }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.primary, false: theme.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { padding: 8, marginRight: 4 },
  h1: { flex: 1, fontSize: 22, fontWeight: '700' },
  section: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: '500' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '500' },
  toggleDesc: { fontSize: 11, marginTop: 2 },
});
