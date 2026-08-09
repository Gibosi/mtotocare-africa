import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Switch, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useToast } from '../../src/components/Toast';
import { useLanguage } from '../../src/i18n/LanguageContext';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { storage, STORAGE_KEYS } from '../../src/utils/storage';
import { BiometricService } from '../../src/utils/biometric';
import i18n from '../../src/i18n';
import { OfflineBanner } from '../../src/components/OfflineBanner';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useTheme();
  const { t, language } = useLanguage();
  const { showError, showSuccess } = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const cap = await BiometricService.getCapability();
        setBiometricAvailable(cap.available);
        setBiometricType(cap.displayName);
        // Check both: the user's preference AND that we have saved credentials
        const saved = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
        const hasCreds = await BiometricService.hasSavedCredentials();
        setBiometricEnabled(saved === 'true' && hasCreds);
        const push = await storage.getItem(STORAGE_KEYS.PUSH_ENABLED);
        setPushEnabled(push !== 'false');
      } catch (e) {
        console.log('[biometric] check failed:', e);
      }
    })();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      language === 'sw' ? 'Toka' : 'Logout',
      language === 'sw' ? 'Una uhakika unataka kutoka?' : 'Are you sure you want to logout?',
      [
        { text: language === 'sw' ? 'Ghairi' : 'Cancel', style: 'cancel' },
        {
          text: language === 'sw' ? 'Toka' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear biometric credentials on logout so the next user
            // can't get in with a fingerprint if this device is shared
            await BiometricService.clearCredentials();
            await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
            await dispatch(logout());
            router.replace('/welcome' as any);
          },
        },
      ],
    );
  };

  const toggleBiometric = async (value: boolean) => {
    if (!value) {
      // Disabling — clear everything
      await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      await BiometricService.clearCredentials();
      setBiometricEnabled(false);
      return;
    }
    // Enabling — must verify identity first
    try {
      if (!biometricAvailable) {
        showError(
          language === 'sw'
            ? 'Tafadhali sanidi fingerprint au face unlock kwenye mipangilio ya simu yako kwanza.'
            : 'Please set up a fingerprint or face unlock in your device settings first.',
        );
        return;
      }
      const result = await BiometricService.authenticate(
        language === 'sw' ? `Thibitisha ili kuwezesha ${biometricType} login` : `Confirm to enable ${biometricType} login`,
      );
      if (result) {
        // Save the user's email + refresh token in secure storage
        // so we can use the biometric prompt to log them in next time
        if (user?.email) {
          const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            await BiometricService.saveCredentials(user.email, refreshToken);
            await storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
            setBiometricEnabled(true);
            showSuccess(
              language === 'sw'
                ? `${biometricType} login imewashwa. Utahaweza kutumia ${biometricType} kuingia mara inayofuata.`
                : `${biometricType} login is now active. Next time, you can use ${biometricType} to sign in.`,
            );
          } else {
            showError('Please log in with your password first, then enable biometric login.');
          }
        }
      }
    } catch (e: any) {
      showError(e?.message || 'Could not enable biometric login');
    }
  };

  const togglePush = async (value: boolean) => {
    setPushEnabled(value);
    await storage.setItem(STORAGE_KEYS.PUSH_ENABLED, value ? 'true' : 'false');
  };

  const languageLabel = i18n.language === 'sw' ? 'Kiswahili' : 'English';

  type MenuItem = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    sublabel?: string;
    toggle?: boolean;
    value?: any;
    onValueChange?: (v: boolean) => void;
    action?: () => void;
    destructive?: boolean;
  };

  const accountSection: MenuItem[] = [
    { icon: 'person-circle-outline', label: 'Edit Profile', action: () => router.push('/profile/edit' as any) },
    { icon: 'lock-closed-outline', label: 'Change Password', action: () => router.push('/profile/change-password' as any) },
    { icon: 'language', label: 'Language', sublabel: languageLabel, action: () => router.push('/profile/language' as any) },
  ];

  const preferencesSection: MenuItem[] = [
    { icon: 'moon-outline', label: 'Dark Mode', toggle: true, value: mode === 'dark', onValueChange: (v) => setMode(v ? 'dark' : 'light') },
    { icon: 'notifications-outline', label: 'Push Notifications', toggle: true, value: pushEnabled, onValueChange: togglePush },
    {
      icon: 'finger-print',
      label: biometricAvailable ? `${biometricType} Login` : 'Biometric Login',
      sublabel: !biometricAvailable ? 'Not set up on this device' : undefined,
      toggle: true,
      value: biometricEnabled,
      onValueChange: toggleBiometric,
    },
  ];

  const supportSection: MenuItem[] = [
    { icon: 'cloud-offline-outline', label: 'Offline Support', action: () => router.push('/offline' as any) },
    { icon: 'calendar-outline', label: 'My Appointments', action: () => router.push('/appointments' as any) },
    { icon: 'notifications', label: 'Notifications', action: () => router.push('/notifications' as any) },
    { icon: 'help-circle-outline', label: 'Help Center', action: () => router.push('/profile/help' as any) },
    { icon: 'document-text-outline', label: 'Privacy Policy', action: () => router.push('/profile/privacy' as any) },
    { icon: 'information-circle-outline', label: 'About', action: () => router.push('/profile/about' as any) },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <OfflineBanner />

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('common.profile')}</Text>
      </View>

      <TouchableOpacity
        style={styles.userSection}
        onPress={() => router.push('/profile/edit' as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.featureBg }]}>
          <Ionicons name="person" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user?.fullName || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user?.email || ''}
        </Text>
        <View style={styles.roleRow}>
          {(user?.roles || ['PARENT']).map(role => (
            <View key={role} style={[styles.roleBadge, { backgroundColor: theme.colors.featureBg }]}>
              <Text style={[styles.roleText, { color: theme.colors.primary }]}>{role}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.editHint, { borderColor: theme.colors.border }]}>
          <Ionicons name="create-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.editHintText, { color: theme.colors.textSecondary }]}>Tap to edit profile</Text>
        </View>
      </TouchableOpacity>

      {[
        { title: 'Account', items: accountSection },
        { title: 'Preferences', items: preferencesSection },
        { title: 'Support', items: supportSection },
      ].map((section, sIdx) => (
        <View key={sIdx} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{section.title.toUpperCase()}</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={[
                  styles.menuRow,
                  iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
                ]}
                onPress={item.toggle ? () => item.onValueChange?.(!item.value) : item.action}
                disabled={!item.action && !item.toggle}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.toggle && item.value ? theme.colors.primary : theme.colors.text}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                  {item.sublabel && (
                    <Text style={[styles.menuSub, { color: theme.colors.textSecondary }]}>
                      {item.sublabel}
                    </Text>
                  )}
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: theme.colors.errorLight }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>{t('common.logout')}</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        MtotoCare Africa v1.0.0
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: '700' },
  userSection: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 20, fontWeight: '700' },
  userEmail: { fontSize: 13, marginTop: 2 },
  roleRow: { flexDirection: 'row', marginTop: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginHorizontal: 4 },
  roleText: { fontSize: 11, fontWeight: '600' },
  editHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  editHintText: { fontSize: 11 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', marginBottom: 6, marginLeft: 4, letterSpacing: 0.5 },
  menuCard: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  menuLabel: { fontSize: 15 },
  menuSub: { fontSize: 11, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, marginTop: 24, paddingVertical: 14, borderRadius: 8 },
  logoutText: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
  version: { textAlign: 'center', fontSize: 12, paddingVertical: 8 },
});
