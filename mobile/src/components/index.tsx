import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export const Loading: React.FC<{ message?: string }> = ({ message }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text style={[theme.typography.body2, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export const EmptyState: React.FC<{ 
  icon?: React.ReactNode; 
  title: string; 
  message?: string;
  action?: React.ReactNode;
}> = ({ icon, title, message, action }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 16, textAlign: 'center' }]}>
        {title}
      </Text>
      {message && (
        <Text style={[theme.typography.body1, { color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
          {message}
        </Text>
      )}
      {action && <View style={{ marginTop: 16 }}>{action}</View>}
    </View>
  );
};

export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ 
  message, onRetry 
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { padding: 16, backgroundColor: theme.colors.errorLight, borderRadius: 8, margin: 16 }]}>
      <Text style={[theme.typography.body1, { color: theme.colors.error, textAlign: 'center' }]}>
        {message}
      </Text>
      {onRetry && (
        <Text 
          style={[theme.typography.button, { color: theme.colors.primary, marginTop: 8, textAlign: 'center' }]}
          onPress={onRetry}
        >
          Tap to retry
        </Text>
      )}
    </View>
  );
};

export const Badge: React.FC<{ 
  label: string; 
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' 
}> = ({ label, variant = 'neutral' }) => {
  const { theme } = useTheme();
  const colors = {
    success: { bg: '#C8E6C9', text: '#1B5E20' },
    warning: { bg: '#FFE0B2', text: '#E65100' },
    error: { bg: '#FFCDD2', text: '#B71C1C' },
    info: { bg: '#BBDEFB', text: '#0D47A1' },
    neutral: { bg: theme.colors.surface, text: theme.colors.textSecondary },
  };
  const c = colors[variant];
  return (
    <View style={{ 
      backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 2, 
      borderRadius: 12, alignSelf: 'flex-start' 
    }}>
      <Text style={{ color: c.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
