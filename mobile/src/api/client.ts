/**
 * Axios HTTP client with JWT interceptors
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * Resolve the API base URL from the first available source:
 *  1. Hard-coded production URL (if MTOTOCARE_API_URL is baked in)
 *  2. Explicit env var: EXPO_PUBLIC_API_URL
 *  3. Extra field in app.json: extra.apiUrl
 *  4. Auto-detect from Expo dev server hostUri (e.g. "192.168.96.168:8081")
 *  5. Android emulator special: 10.0.2.2
 *  6. localhost
 */
const resolveApiUrl = (): string => {
  // 1. Production baked-in
  // @ts-ignore
  const prodUrl = (typeof process !== 'undefined' && process.env?.MTOTOCARE_API_URL) || '';
  if (prodUrl) return prodUrl;

  // 2. EXPO_PUBLIC_API_URL (set via .env)
  // @ts-ignore
  const envUrl = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || '';
  if (envUrl) return envUrl;

  // 3. extra.apiUrl in app.json
  const extra = (Constants.expoConfig?.extra as any) || {};
  if (extra.apiUrl && extra.apiUrl !== 'http://10.0.2.2:8080/api') {
    return extra.apiUrl;
  }

  // 4. Auto-detect from Expo dev server
  const hostUri: string | undefined =
    (Constants.expoGoConfig?.developer?.tool === 'expo-cli'
      ? (Constants.expoConfig?.hostUri as string | undefined)
      : undefined) ||
    (Constants.expoConfig?.hostUri as string | undefined) ||
    (Constants.expoGoConfig?.debuggerHost as string | undefined);

  if (hostUri) {
    // hostUri looks like "192.168.96.168:8081" — strip the port, the backend runs on 8080
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080/api`;
    }
  }

  // 5. Android emulator special IP
  // (we can detect via Platform.OS if needed)
  // 6. localhost fallback
  return 'http://10.0.2.2:8080/api';
};

export const API_URL = resolveApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Friendly error message on connection failure
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      // timeout
    }
    if (error.message === 'Network Error') {
      error.message = `Cannot reach backend at ${API_URL}. Make sure:\n• Backend is running (cd backend && mvn spring-boot:run)\n• Phone and PC are on the same Wi-Fi\n• Windows Firewall allows port 8080`;
    }
    return Promise.reject(error);
  }
);

// Request interceptor - attach JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 (refresh token)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed && original.headers) {
        const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          (original.headers as any).Authorization = `Bearer ${token}`;
          return apiClient.request(original);
        }
      }
      // Refresh failed - clear auth
      await storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);
    }
    return Promise.reject(error);
  }
);

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    if (response.data?.data?.accessToken) {
      await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const getApiError = (err: any): string => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.errorCode) return err.response.data.errorCode;
  if (err?.message) return err.message;
  return 'An unexpected error occurred';
};

export const getApiErrorCode = (err: any): string | undefined => {
  return err?.response?.data?.errorCode;
};
