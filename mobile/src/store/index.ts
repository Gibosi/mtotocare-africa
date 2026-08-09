import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import childrenReducer from './slices/childrenSlice';
import notificationsReducer from './slices/notificationsSlice';
import appointmentsReducer from './slices/appointmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    notifications: notificationsReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
