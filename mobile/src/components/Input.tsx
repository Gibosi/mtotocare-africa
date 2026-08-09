import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}{required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text },
            style,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 15 },
  icon: { marginHorizontal: 4 },
  error: { fontSize: 12, marginTop: 4 },
  hint: { fontSize: 12, marginTop: 4 },
});
