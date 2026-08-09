/**
 * App Initializer
 * 
 * Ties together all the offline-first services:
 * - Database
 * - Connectivity monitor
 * - Sync manager
 * - AI offline library
 * - Auth
 * 
 * Call this ONCE in the root layout.
 */

import { getDatabase, closeDatabase } from '../database';
import { connectivity } from './connectivity';
import { syncManager } from './syncManager';
import { aiOfflineLibrary } from './aiOfflineLibrary';
import { offlineAuth, InitResult } from './offlineAuth';
import { childrenRepo, vaccinationsRepo, growthRepo, appointmentsRepo } from './repository';

class AppInitializer {
  private initialized = false;
  private stopBackgroundSync: (() => void) | null = null;

  /**
   * Initialize the app on startup.
   * Call from root _layout.tsx
   */
  async initialize(): Promise<InitResult> {
    if (this.initialized) {
      return offlineAuth.initialize();
    }

    console.log('[AppInitializer] Starting app initialization...');

    try {
      // 1. Initialize database (creates tables)
      await getDatabase();
      console.log('[AppInitializer] ✓ Database ready');

      // 2. Connectivity monitoring is ready as soon as it's imported — no
      //    separate init step (it wraps NetInfo, which is ready immediately).
      console.log('[AppInitializer] ✓ Connectivity monitor ready');

      // 3. The offline AI library is a static keyword-matching table — no
      //    async seeding needed, it's ready as soon as it's imported.
      console.log('[AppInitializer] ✓ AI offline library ready');

      // 4. Start background sync (retries queued actions whenever the
      //    device comes back online). Keep the unsubscribe fn for destroy().
      this.stopBackgroundSync = syncManager.startBackgroundSync();
      console.log('[AppInitializer] ✓ Sync manager ready');

      // 5. Run auth initialization
      const result = await offlineAuth.initialize();
      console.log(`[AppInitializer] ✓ Auth: ${result.reason} (offline: ${result.isOffline})`);

      this.initialized = true;
      return result;
    } catch (err) {
      console.error('[AppInitializer] Initialization failed:', err);
      throw err;
    }
  }

  /**
   * Warm up the local cache for the dashboard.
   * Triggers background sync of children, vaccinations, etc.
   */
  async warmCache(): Promise<void> {
    if (!(await connectivity.isConnected())) return;

    const tasks = [
      childrenRepo.backgroundSync().catch(console.warn),
      vaccinationsRepo.backgroundSync().catch(console.warn),
      growthRepo.backgroundSync().catch(console.warn),
      appointmentsRepo.backgroundSync().catch(console.warn),
    ];
    await Promise.allSettled(tasks);
  }

  /**
   * Cleanup on app close (mostly for testing).
   */
  async destroy(): Promise<void> {
    this.stopBackgroundSync?.();
    this.stopBackgroundSync = null;
    await closeDatabase();
    this.initialized = false;
  }
}

export const appInitializer = new AppInitializer();
