import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api';
import { Notification } from '../../types';
import { getApiError } from '../../api/client';

interface NotificationsState {
  list: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  list: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsApi.getAll(0, 50);
      return res.data.data?.content || [];
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsApi.getUnreadCount();
      return res.data.data || 0;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationsApi.markAsRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllAsRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    addLocal: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.list.find(x => x.id === action.payload);
        if (n && !n.read) {
          n.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list.forEach(n => { n.read = true; });
        state.unreadCount = 0;
      });
  },
});

export const { clearError, addLocal } = notificationsSlice.actions;
export default notificationsSlice.reducer;
