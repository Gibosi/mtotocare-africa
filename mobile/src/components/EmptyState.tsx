import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'file-tray-outline', title, message, action }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 40 },
  title: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  message: { fontSize: 13, marginTop: 6, textAlign: 'center' },
  action: { marginTop: 16 },
});
