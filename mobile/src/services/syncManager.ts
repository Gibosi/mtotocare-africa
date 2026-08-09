/**
 * Sync manager - handles offline actions queue
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { connectivity } from './connectivity';

interface QueuedAction {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  createdAt: number;
  attempts: number;
}

const QUEUE_KEY = '@mtotocare/sync_queue';

export const syncManager = {
  async queueAction(action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      attempts: 0,
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async getQueue(): Promise<QueuedAction[]> {
    try {
      const json = await AsyncStorage.getItem(QUEUE_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  async runSync(): Promise<{ synced: number; failed: number }> {
    const online = await connectivity.isConnected();
    if (!online) {
      return { synced: 0, failed: 0 };
    }
    const queue = await this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await apiClient.request({
          method: action.method,
          url: action.url,
          data: action.data,
        });
        synced++;
      } catch (e: any) {
        action.attempts++;
        if (action.attempts >= 3) {
          failed++;
        } else {
          remaining.push(action);
        }
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return { synced, failed };
  },

  startBackgroundSync() {
    return connectivity.addListener(async (isConnected) => {
      if (isConnected) {
        await this.runSync();
      }
    });
  },
};
