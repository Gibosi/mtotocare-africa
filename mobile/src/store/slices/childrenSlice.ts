import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { childrenApi } from '../../api';
import { Child, ChildRequest } from '../../types';
import { getApiError } from '../../api/client';
import { storage, STORAGE_KEYS } from '../../utils/storage';

interface ChildrenState {
  list: Child[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChildrenState = {
  list: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await childrenApi.getAll();
      return response.data.data || [];
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const addChild = createAsyncThunk(
  'children/add',
  async (data: ChildRequest, { rejectWithValue }) => {
    try {
      const response = await childrenApi.add(data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, data }: { id: number; data: ChildRequest }, { rejectWithValue }) => {
    try {
      const response = await childrenApi.update(id, data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const deleteChild = createAsyncThunk(
  'children/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await childrenApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {
    selectChild: (state, action: PayloadAction<number | null>) => {
      state.selectedId = action.payload;
      if (action.payload !== null) {
        storage.setItem(STORAGE_KEYS.SELECTED_CHILD_ID, String(action.payload));
      }
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        if (!state.selectedId && action.payload.length > 0) {
          state.selectedId = action.payload[0].id;
          storage.setItem(STORAGE_KEYS.SELECTED_CHILD_ID, String(action.payload[0].id));
        }
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addChild.fulfilled, (state, action) => {
        state.list.push(action.payload);
        if (!state.selectedId) {
          state.selectedId = action.payload.id;
        }
      })
      .addCase(addChild.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateChild.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.list = state.list.filter(c => c.id !== action.payload);
        if (state.selectedId === action.payload) {
          state.selectedId = state.list[0]?.id || null;
        }
      });
  },
});

export const { selectChild, clearError } = childrenSlice.actions;
export default childrenSlice.reducer;
