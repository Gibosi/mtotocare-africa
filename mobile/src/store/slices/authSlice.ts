import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '../../types';
import { storage, STORAGE_KEYS } from '../../utils/storage';
import { getApiError } from '../../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  initialized: false,
};

const persistAuth = async (data: AuthResponse) => {
  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userJson = await storage.getItem(STORAGE_KEYS.USER);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        return { token, user };
      } catch {
        return null;
      }
    }
    return null;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);
      const auth = res.data.data;
      await persistAuth(auth);
      return auth;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data);
      const auth = res.data.data;
      await persistAuth(auth);
      return auth;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch {
    // ignore network error on logout
  }
  await storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  await storage.removeItem(STORAGE_KEYS.USER);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initialized = true;
        if (action.payload) {
          state.accessToken = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
