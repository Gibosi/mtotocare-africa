import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use AsyncStorage on web/Android, SecureStore as a non-blocking optional
// upgrade on native. This avoids hangs when expo-secure-store is not
// available (e.g. Expo Go without native module, or some web previews).
const useSecureStore =
  Platform.OS === 'ios' ||
  (Platform.OS === 'android' && typeof SecureStore?.getItemAsync === 'function');

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (useSecureStore) {
      try {
        const v = await Promise.race([
          SecureStore.getItemAsync(key),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
        ]);
        if (v != null) return v;
      } catch {
        // fall through to AsyncStorage
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (useSecureStore) {
      try {
        await Promise.race([
          SecureStore.setItemAsync(key, value),
          new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ]);
        return;
      } catch {
        // fall through to AsyncStorage
      }
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },

  async removeItem(key: string): Promise<void> {
    if (useSecureStore) {
      try {
        await Promise.race([
          SecureStore.deleteItemAsync(key),
          new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ]);
      } catch {
        // ignore
      }
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME_MODE: '@mtotocare/theme_mode',
  LANGUAGE: '@mtotocare/language',
  SELECTED_CHILD_ID: '@mtotocare/selectedChildId',
  BIOMETRIC_ENABLED: '@mtotocare/biometricEnabled',
  PUSH_ENABLED: '@mtotocare/pushEnabled',
} as const;
