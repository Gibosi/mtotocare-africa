/**
 * Biometric authentication service.
 * Wraps expo-local-authentication and provides a secure way to save
 * and retrieve a user's credentials so they can log in with a fingerprint/face
 * instead of typing the password.
 *
 * Storage: we use expo-secure-store (hardware-encrypted) for the refresh
 * token and email, NOT for the password (we never store the password).
 *
 * Flow:
 *  1. User logs in normally with email + password
 *  2. User goes to Profile → enables biometric
 *  3. We ask the OS to authenticate (fingerprint/face)
 *  4. On success, we save { email, refreshToken } in SecureStore
 *  5. Next time the app opens or they tap "Use fingerprint" on login,
 *     we prompt for biometric, then call /auth/refresh to get a new access token
 */
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const SECURE_KEYS = {
  EMAIL: 'mtotocare_biometric_email',
  REFRESH: 'mtotocare_biometric_refresh',
}

export interface BiometricCapability {
  available: boolean
  type: 'fingerprint' | 'face' | 'iris' | 'none'
  displayName: string  // e.g. "Fingerprint", "Face ID"
}

export const BiometricService = {
  /**
   * Check whether the device supports biometric login and what type.
   */
  async getCapability(): Promise<BiometricCapability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (!hasHardware || !isEnrolled) {
        return { available: false, type: 'none', displayName: 'Biometric' }
      }
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
      let type: BiometricCapability['type'] = 'none'
      let displayName = 'Biometric'
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        type = 'face'
        displayName = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock'
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        type = 'fingerprint'
        displayName = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint'
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        type = 'iris'
        displayName = 'Iris'
      }
      return { available: true, type, displayName }
    } catch {
      return { available: false, type: 'none', displayName: 'Biometric' }
    }
  },

  /**
   * Prompt the user to authenticate with biometric.
   * Returns true if the user successfully authenticated.
   */
  async authenticate(promptMessage: string, cancelLabel = 'Cancel'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
      })
      return result.success === true
    } catch {
      return false
    }
  },

  /**
   * Save credentials securely for biometric login.
   * Call AFTER a successful biometric prompt.
   */
  async saveCredentials(email: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(SECURE_KEYS.EMAIL, email)
    await SecureStore.setItemAsync(SECURE_KEYS.REFRESH, refreshToken)
  },

  /**
   * Read saved credentials (returns null if not set).
   */
  async getSavedCredentials(): Promise<{ email: string; refreshToken: string } | null> {
    try {
      const email = await SecureStore.getItemAsync(SECURE_KEYS.EMAIL)
      const refresh = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH)
      if (email && refresh) return { email, refreshToken: refresh }
      return null
    } catch {
      return null
    }
  },

  /**
   * Check if biometric credentials are saved on this device.
   */
  async hasSavedCredentials(): Promise<boolean> {
    const creds = await this.getSavedCredentials()
    return creds !== null
  },

  /**
   * Clear saved credentials (on logout or user disables biometric).
   */
  async clearCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SECURE_KEYS.EMAIL)
      await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH)
    } catch {
      // ignore
    }
  },
}
