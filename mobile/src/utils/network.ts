import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * NFR-051 to NFR-056: Offline support helpers
 *
 * - useNetworkStatus: tells components whether the device is online
 *   and whether to show the "offline" banner.
 * - pendingActionQueue: a tiny in-memory + AsyncStorage-backed queue
 *   of mutations performed while offline. When the network comes
 *   back, the app drains the queue by replaying each action.
 */

export type QueuedAction = {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  createdAt: number;
  description: string;
};

const STORAGE_KEY = '@mtotocare/pendingActions';

let memoryQueue: QueuedAction[] = [];
let memoryLoaded = false;

async function loadQueue(): Promise<QueuedAction[]> {
  if (memoryLoaded) return memoryQueue;
  try {
    const { storage } = await import('./storage');
    const raw = await storage.getItem(STORAGE_KEY);
    if (raw) memoryQueue = JSON.parse(raw);
  } catch {
    // ignore
  }
  memoryLoaded = true;
  return memoryQueue;
}

async function saveQueue() {
  try {
    const { storage } = await import('./storage');
    await storage.setItem(STORAGE_KEY, JSON.stringify(memoryQueue));
  } catch {
    // ignore
  }
}

export async function enqueueAction(action: Omit<QueuedAction, 'id' | 'createdAt'>): Promise<QueuedAction> {
  const queue = await loadQueue();
  const entry: QueuedAction = {
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  memoryQueue = [...queue, entry];
  await saveQueue();
  return entry;
}

export async function getQueue(): Promise<QueuedAction[]> {
  return loadQueue();
}

export async function getQueueSize(): Promise<number> {
  return (await loadQueue()).length;
}

export async function removeFromQueue(id: string) {
  const queue = await loadQueue();
  memoryQueue = queue.filter(a => a.id !== id);
  await saveQueue();
}

export async function clearQueue() {
  memoryQueue = [];
  await saveQueue();
}

/**
 * Hook: subscribe to network state. Returns:
 *   - isConnected: true if device has any network
 *   - isInternetReachable: true if the network is actually usable
 *
 * Defaults to `true` (online) if the platform doesn't support NetInfo.
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = NetInfo.addEventListener((state: NetInfoState) => {
        setIsConnected(!!state.isConnected);
        setIsInternetReachable(state.isInternetReachable !== false);
      });
    } catch {
      // NetInfo not available, assume online
    }
    return () => {
      try { unsub?.(); } catch { /* noop */ }
    };
  }, []);

  return { isConnected, isInternetReachable, isOnline: isConnected && isInternetReachable };
}
