import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'flat' | 'outlined' | 'elevated';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'outlined', padding = 16 }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
          borderWidth: variant === 'outlined' ? 1 : 0,
          padding,
          shadowColor: theme.colors.shadow,
          shadowOpacity: variant === 'elevated' ? 0.15 : 0,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: variant === 'elevated' ? 4 : 0,
          elevation: variant === 'elevated' ? 2 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
});
