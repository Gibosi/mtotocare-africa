import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';

function AdminTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();

  const tabs = [
    { name: 'dashboard', label: 'Dashboard', icons: ['grid', 'grid-outline'] },
    { name: 'users', label: 'Users', icons: ['people', 'people-outline'] },
    { name: 'facilities', label: 'Facilities', icons: 'business' },
    { name: 'audit', label: 'Audit', icons: 'document-text' },
    { name: 'profile', label: 'Profile', icons: ['person', 'person-outline'] },
  ];

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs.find(t => t.name === route.name) || { label: route.name, icons: ['help', 'help-outline'] };
        const iconName = Array.isArray(tab.icons) ? (isFocused ? tab.icons[0] : tab.icons[1]) : tab.icons;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => { if (!isFocused) navigation.navigate(route.name); }}
          >
            <Ionicons name={iconName as any} size={22} color={isFocused ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={{
              fontSize: 10, marginTop: 2,
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              fontWeight: isFocused ? '600' : '400',
            }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AdminLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="users" />
      <Tabs.Screen name="facilities" />
      <Tabs.Screen name="audit" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', height: 64, borderTopWidth: 1, alignItems: 'center', justifyContent: 'space-around' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 8 },
});
