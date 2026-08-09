import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../src/i18n/LanguageContext';

// 5-slot fixed tab bar layout. Order: Home | Records | [+] | Reminders | Profile
// The middle slot is always the FAB. Tapping it = book appointment,
// long-pressing it = add a child. This avoids relying on `state.routes`
// (which may not include the placeholder add-center route on first render
// and would trigger a "No route named" warning).
const TAB_ORDER = ['home', 'records', 'fab', 'reminders', 'profile'] as const;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [showHint, setShowHint] = useState(false);

  const icons: { [key: string]: [string, string] } = {
    home: ['home', 'home-outline'],
    records: ['folder', 'folder-outline'],
    reminders: ['notifications', 'notifications-outline'],
    profile: ['person', 'person-outline'],
  };
  const labels: { [key: string]: string } = {
    home: t('nav.home') || 'Home',
    records: t('nav.records') || 'Records',
    reminders: t('nav.reminders') || 'Reminders',
    profile: t('nav.profile') || 'Profile',
  };

  // Resolve which tab is currently focused by matching the active route name
  // against the Tabs.Screen names registered (home | records | reminders | profile).
  const activeName: string =
    state?.routes?.[state.index]?.name || 'home';

  const goTo = (routeName: string) => {
    if (routeName === activeName) return;
    const ev = navigation.emit({
      type: 'tabPress',
      target: state.routes.find((r: any) => r.name === routeName)?.key,
      canPreventDefault: true,
    });
    if (!ev?.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
      ]}
    >
      {TAB_ORDER.map((slot) => {
        if (slot === 'fab') {
          return (
            <View key="fab-slot" style={styles.fabSlot}>
              {showHint && (
                <View
                  style={[
                    styles.hint,
                    { backgroundColor: theme.colors.text, borderColor: theme.colors.background },
                  ]}
                >
                  <Text style={[styles.hintText, { color: theme.colors.background }]}>
                    {t('tabs.longPressHint') || 'Long-press to add a child'}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.fabWrap}
                onPress={() => {
                  setShowHint(false);
                  router.push('/appointments/book' as any);
                }}
                onLongPress={() => {
                  setShowHint(false);
                  router.push('/child-records/add' as any);
                }}
                onPressIn={() => setShowHint(true)}
                onPressOut={() => setShowHint(false)}
                delayLongPress={400}
                activeOpacity={0.85}
                hitSlop={8}
              >
                <View style={[styles.fabInner, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="add" size={34} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          );
        }

        const isFocused = slot === activeName;
        const iconPair = icons[slot] || ['help', 'help-outline'];
        return (
          <TouchableOpacity
            key={slot}
            style={styles.tab}
            onPress={() => goTo(slot)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isFocused ? iconPair[0] : iconPair[1]) as any}
              size={22}
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: isFocused ? '600' : '400',
              }}
            >
              {labels[slot]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="reminders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 72,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 8 },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fabWrap: {
    width: 64,
    height: 64,
    marginTop: -28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  hint: {
    position: 'absolute',
    top: -32,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
  hintText: { fontSize: 10, fontWeight: '600' },
});
