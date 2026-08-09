/**
 * Connectivity detection service
 */
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const connectivity = {
  isConnected(): Promise<boolean> {
    return NetInfo.fetch().then(state => state.isConnected === true && state.isInternetReachable !== false);
  },

  addListener(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      callback(state.isConnected === true && state.isInternetReachable !== false);
    });
  },
};

/**
 * React hook: subscribes to connectivity changes and returns the current
 * online status, starting optimistically as `true` until the first check
 * resolves (matches NetInfo's own default assumption).
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    connectivity.isConnected().then(v => {
      if (mounted) setIsOnline(v);
    });
    const unsubscribe = connectivity.addListener(v => {
      if (mounted) setIsOnline(v);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isOnline;
}
