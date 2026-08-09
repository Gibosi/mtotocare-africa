import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentsApi } from '../../api';
import { Appointment, AppointmentRequest } from '../../types';
import { getApiError } from '../../api/client';

interface AppointmentsState {
  list: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await appointmentsApi.getAll();
      return res.data.data || [];
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (data: AppointmentRequest, { rejectWithValue }) => {
    try {
      const res = await appointmentsApi.book(data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
    try {
      const res = await appointmentsApi.cancel(id, reason);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/reschedule',
  async ({ id, newDateTime }: { id: number; newDateTime: string }, { rejectWithValue }) => {
    try {
      const res = await appointmentsApi.reschedule(id, newDateTime);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(getApiError(err));
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export const { clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
