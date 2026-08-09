import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  style,
  fullWidth,
}) => {
  const { theme } = useTheme();

  const sizeStyle = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { paddingVertical: 12, paddingHorizontal: 18, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 22, fontSize: 16 },
  }[size];

  const variantStyle = (() => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary, text: '#FFFFFF', border: theme.colors.primary };
      case 'secondary':
        return { bg: theme.colors.surface, text: theme.colors.text, border: theme.colors.border };
      case 'outline':
        return { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary };
      case 'danger':
        return { bg: theme.colors.error, text: '#FFFFFF', border: theme.colors.error };
      case 'ghost':
        return { bg: 'transparent', text: theme.colors.primary, border: 'transparent' };
    }
  })();

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          borderRadius: theme.radius.md,
          opacity: disabled || loading ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        sizeStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: variantStyle.text, fontSize: sizeStyle.fontSize, marginLeft: icon ? 6 : 0 }]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: { fontWeight: '600' },
});
