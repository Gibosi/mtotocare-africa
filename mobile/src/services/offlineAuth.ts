/**
 * Offline Auth Service
 * 
 * Implements the architecture spec:
 * ONLINE: Validate JWT → Download latest data → Dashboard
 * OFFLINE: Read Secure Storage → If JWT exists → Load Cached Data → Dashboard (Offline)
 *         If no JWT → "No previous login" → Welcome
 */

import * as SecureStore from 'expo-secure-store';
import { getDatabase } from '../database';
import { connectivity } from './connectivity';
import { syncManager } from './syncManager';
import { apiClient } from '../api/client';

export interface InitResult {
  isAuthenticated: boolean;
  isOffline: boolean;
  reason: 'no_token' | 'expired_token' | 'no_network' | 'no_previous_login' | 'success';
  user: any | null;
}

class OfflineAuthService {
  private ACCESS_KEY = 'accessToken';
  private REFRESH_KEY = 'refreshToken';
  private USER_KEY = 'cachedUser';

  /**
   * Initialize the app:
   * - Check connectivity
   * - If online: validate JWT, refresh if needed, download data
   * - If offline: load from local DB
   */
  async initialize(): Promise<InitResult> {
    const isOnline = await connectivity.isConnected();

    if (isOnline) {
      return this.onlineInit();
    } else {
      return this.offlineInit();
    }
  }

  /**
   * Online initialization
   * Server Reachable? → Validate JWT → Download → Dashboard
   * Server Not Reachable? → Offline Mode
   */
  private async onlineInit(): Promise<InitResult> {
    try {
      const accessToken = await SecureStore.getItemAsync(this.ACCESS_KEY);
      
      if (!accessToken) {
        return { isAuthenticated: false, isOffline: false, reason: 'no_token', user: null };
      }

      // Validate token by fetching current user
      const response = await apiClient.get('/users/me');
      const user = response.data?.data;
      
      if (!user) {
        return { isAuthenticated: false, isOffline: false, reason: 'expired_token', user: null };
      }

      // Cache user
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      await this.cacheUser(user);

      // Download all latest data in background
      syncManager.runSync().catch(console.error);

      return { isAuthenticated: true, isOffline: false, reason: 'success', user };
    } catch (err: any) {
      // Server unreachable despite "online" status
      if (err.message?.includes('Network') || !err.response) {
        return this.offlineInit();
      }
      // Token invalid
      return { isAuthenticated: false, isOffline: false, reason: 'expired_token', user: null };
    }
  }

  /**
   * Offline initialization
   * JWT Exists? → Read Local Database → Dashboard (Offline)
   * No JWT → "No previous login found" → Welcome
   */
  private async offlineInit(): Promise<InitResult> {
    const accessToken = await SecureStore.getItemAsync(this.ACCESS_KEY);
    
    if (!accessToken) {
      return { isAuthenticated: false, isOffline: true, reason: 'no_previous_login', user: null };
    }

    // Load cached user from secure storage
    const userStr = await SecureStore.getItemAsync(this.USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      return { isAuthenticated: false, isOffline: true, reason: 'no_previous_login', user: null };
    }

    return { isAuthenticated: true, isOffline: true, reason: 'no_network', user };
  }

  /**
   * Cache user in local DB.
   */
  private async cacheUser(user: any): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO users (
        id, full_name, email, phone_number, profile_picture_url,
        preferred_language, email_verified, phone_verified, active, roles, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id, user.fullName, user.email, user.phoneNumber || null,
        user.profilePictureUrl || null, user.preferredLanguage || 'en',
        user.emailVerified ? 1 : 0, user.phoneVerified ? 1 : 0,
        user.active !== false ? 1 : 0, JSON.stringify(user.roles || []),
        new Date().toISOString(),
      ]
    );
  }

  /**
   * Save tokens to secure storage.
   */
  async saveTokens(accessToken: string, refreshToken: string, user?: any): Promise<void> {
    await SecureStore.setItemAsync(this.ACCESS_KEY, accessToken);
    await SecureStore.setItemAsync(this.REFRESH_KEY, refreshToken);
    if (user) {
      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get stored access token.
   */
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(this.ACCESS_KEY);
  }

  /**
   * Logout - clear all local data (per spec).
   * Delete JWT, Delete Refresh Token, Delete Secure Storage,
   * Delete Local Database, Delete Queue, Delete Cached Files
   */
  async logout(): Promise<void> {
    // Clear secure storage
    await SecureStore.deleteItemAsync(this.ACCESS_KEY);
    await SecureStore.deleteItemAsync(this.REFRESH_KEY);
    await SecureStore.deleteItemAsync(this.USER_KEY);

    // Clear local database (per spec: clearing clinical data is safer)
    const db = await getDatabase();
    const tables = [
      'children', 'vaccinations', 'growth_records', 'nutrition_plans',
      'health_records', 'appointments', 'notifications', 'ai_conversations',
      'users', 'sync_queue', 'file_upload_queue', 'health_library',
      'vaccination_schedule',
    ];
    for (const t of tables) {
      try {
        await db.execAsync(`DELETE FROM ${t};`);
      } catch (e) {
        // ignore
      }
    }
  }
}

export const offlineAuth = new OfflineAuthService();
