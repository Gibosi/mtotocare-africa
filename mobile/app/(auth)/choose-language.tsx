import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import i18n from '../../src/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', name: 'English', greeting: 'Hello, how can I help you?' },
  { code: 'sw', name: 'Kiswahili', greeting: 'Habari, naweza kukusaidia?' },
];

export default function ChooseLanguageScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [current, setCurrent] = React.useState(i18n.language || 'en');

  const selectLanguage = async (code: string) => {
    setCurrent(code);
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('@mtotocare/language', code);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={[styles.iconCircle, { backgroundColor: theme.colors.featureBg }]}>
        <Ionicons name="language" size={48} color={theme.colors.primary} />
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>Choose Language</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Select your preferred language
      </Text>

      {LANGUAGES.map(lang => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.langCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: current === lang.code ? theme.colors.primary : theme.colors.border,
              borderWidth: current === lang.code ? 2 : 1,
            },
          ]}
          onPress={() => selectLanguage(lang.code)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.langName, { color: theme.colors.text }]}>{lang.name}</Text>
            <Text style={[styles.langGreeting, { color: theme.colors.textSecondary }]}>{lang.greeting}</Text>
          </View>
          {current === lang.code && (
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.continueBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
        onPress={() => router.back()}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 16 },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  langName: { fontSize: 16, fontWeight: '600' },
  langGreeting: { fontSize: 13, marginTop: 4 },
  continueBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
