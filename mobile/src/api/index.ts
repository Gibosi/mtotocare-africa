/**
 * API service layer - calls all backend endpoints
 */
import { apiClient, API_URL } from './client';
import { storage, STORAGE_KEYS } from '../utils/storage';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  Child, ChildRequest,
  Vaccination, VaccinationSchedule,
  GrowthRecord, GrowthRequest,
  NutritionPlan,
  Appointment, AppointmentRequest,
  AIChatRequest, AIChatMessage,
  Notification,
  Allergy, Medication, Diagnosis,
  HealthcareWorker, Facility,
  AuditLog, SystemSettings, User,
  PageResponse,
} from '../types';

// =========== AUTH ===========
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),
  register: (data: RegisterRequest) =>
    apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', data),
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  logoutAll: () => apiClient.post('/auth/logout-all'),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
  me: () => apiClient.get<{ success: boolean; data: User }>('/auth/me'),
};

// =========== USERS ===========
export const usersApi = {
  getAll: (page = 0, size = 50) =>
    apiClient.get<{ success: boolean; data: PageResponse<User> }>(`/users?page=${page}&size=${size}`),
  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: User }>(`/users/${id}`),
  // Update profile (calls /users/me on the backend)
  updateMe: (data: Partial<User>) =>
    apiClient.put<{ success: boolean; data: User }>(`/users/me`, data),
  // Admin-only update of any user by ID
  update: (id: number, data: Partial<User>) =>
    apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
  activate: (id: number) =>
    apiClient.put<{ success: boolean; data: User }>(`/users/${id}/activate`),
  deactivate: (id: number) =>
    apiClient.put<{ success: boolean; data: User }>(`/users/${id}/deactivate`),
  assignRole: (userId: number, role: string) =>
    apiClient.post(`/users/${userId}/roles`, { role }),
  removeRole: (userId: number, role: string) =>
    apiClient.delete(`/users/${userId}/roles/${role}`),
};

// =========== CHILDREN ===========
export const childrenApi = {
  getAll: () => apiClient.get<{ success: boolean; data: Child[] }>('/children'),
  getById: (id: number) => apiClient.get<{ success: boolean; data: Child }>(`/children/${id}`),
  add: (data: ChildRequest) =>
    apiClient.post<{ success: boolean; data: Child }>('/children', data),
  update: (id: number, data: ChildRequest) =>
    apiClient.put<{ success: boolean; data: Child }>(`/children/${id}`, data),
  delete: (id: number) => apiClient.delete(`/children/${id}`),
};

// =========== VACCINATIONS ===========
export const vaccinationsApi = {
  getForChild: (childId: number) =>
    apiClient.get<{ success: boolean; data: Vaccination[] }>(`/vaccinations/child/${childId}`),
  getSchedules: () =>
    apiClient.get<{ success: boolean; data: VaccinationSchedule[] }>('/vaccinations/schedules'),
  getActiveSchedules: () =>
    apiClient.get<{ success: boolean; data: VaccinationSchedule[] }>('/vaccinations/schedules/active'),
  getUpcoming: (days: number = 30) =>
    apiClient.get<{ success: boolean; data: Vaccination[] }>(`/vaccinations/upcoming?days=${days}`),
  getOverdue: () =>
    apiClient.get<{ success: boolean; data: Vaccination[] }>('/vaccinations/overdue'),
  record: (childId: number, data: { scheduleId: number; administeredAt: string; clinicName?: string; batchNumber?: string; notes?: string }) =>
    apiClient.post<{ success: boolean; data: Vaccination }>(`/vaccinations/child/${childId}`, data),
};

// =========== GROWTH ===========
export const growthApi = {
  getForChild: (childId: number) =>
    apiClient.get<{ success: boolean; data: GrowthRecord[] }>(`/growth/child/${childId}`),
  getLatest: (childId: number) =>
    apiClient.get<{ success: boolean; data: GrowthRecord }>(`/growth/child/${childId}/latest`),
  add: (childId: number, data: GrowthRequest) =>
    apiClient.post<{ success: boolean; data: GrowthRecord }>(`/growth/child/${childId}`, data),
};

// =========== NUTRITION ===========
export const nutritionApi = {
  generateDaily: (childId: number) =>
    apiClient.post<{ success: boolean; data: NutritionPlan[] }>(`/nutrition/child/${childId}/generate`),
  getDaily: (childId: number, date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get<{ success: boolean; data: NutritionPlan[] }>(`/nutrition/child/${childId}/daily${params}`);
  },
  getWeekly: (childId: number, startDate: string) =>
    apiClient.get<{ success: boolean; data: NutritionPlan[] }>(`/nutrition/child/${childId}/weekly?startDate=${startDate}`),
};

// =========== APPOINTMENTS ===========
export const appointmentsApi = {
  getAll: () => apiClient.get<{ success: boolean; data: Appointment[] }>('/appointments'),
  getById: (id: number) => apiClient.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`),
  book: (data: AppointmentRequest) =>
    apiClient.post<{ success: boolean; data: Appointment }>('/appointments', data),
  cancel: (id: number, reason?: string) =>
    apiClient.put<{ success: boolean; data: Appointment }>(`/appointments/${id}/cancel`, null, { params: { reason } }),
  reschedule: (id: number, newDateTime: string) =>
    apiClient.put<{ success: boolean; data: Appointment }>(`/appointments/${id}/reschedule`, { appointmentDatetime: newDateTime }),
  confirm: (id: number) =>
    apiClient.put<{ success: boolean; data: Appointment }>(`/appointments/${id}/confirm`),
  complete: (id: number, notes?: string) =>
    apiClient.put<{ success: boolean; data: Appointment }>(`/appointments/${id}/complete`, null, { params: { notes } }),
};

// =========== DOCTORS / HEALTHCARE WORKERS ===========
export const doctorsApi = {
  getAll: (params?: { specialization?: string; facilityId?: number; onDutyOnly?: boolean }) =>
    apiClient.get<{ success: boolean; data: HealthcareWorker[] }>('/doctors', { params }),
  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: HealthcareWorker }>(`/doctors/${id}`),
  getByUserId: (userId: number) =>
    apiClient.get<{ success: boolean; data: HealthcareWorker }>(`/doctors/user/${userId}`),
  myPatients: () =>
    apiClient.get<{ success: boolean; data: Child[] }>('/doctors/me/patients'),
  myAppointments: () =>
    apiClient.get<{ success: boolean; data: Appointment[] }>('/doctors/me/appointments'),
  updateAvailability: (isOnDuty: boolean) =>
    apiClient.put<{ success: boolean; data: HealthcareWorker }>('/doctors/me/availability', { isOnDuty }),
};

// =========== FACILITIES ===========
export const facilitiesApi = {
  getAll: (params?: { city?: string; region?: string; type?: string }) =>
    apiClient.get<{ success: boolean; data: Facility[] }>('/facilities', { params }),
  getById: (id: number) =>
    apiClient.get<{ success: boolean; data: Facility }>(`/facilities/${id}`),
  create: (data: Partial<Facility>) =>
    apiClient.post<{ success: boolean; data: Facility }>('/facilities', data),
  update: (id: number, data: Partial<Facility>) =>
    apiClient.put<{ success: boolean; data: Facility }>(`/facilities/${id}`, data),
  delete: (id: number) => apiClient.delete(`/facilities/${id}`),
};

// =========== AI ===========
export const aiApi = {
  chat: (data: AIChatRequest) =>
    apiClient.post<{ success: boolean; data: AIChatMessage }>('/ai/chat', data),
  getHistory: (page: number = 0, size: number = 20) =>
    apiClient.get<{ success: boolean; data: PageResponse<AIChatMessage> }>(`/ai/history?page=${page}&size=${size}`),
  clearHistory: () => apiClient.delete('/ai/history'),
  /**
   * Server-Sent Events streaming chat. Calls `onChunk` for each token
   * received from the AI. Calls `onDone` with the final AIChatMessage
   * once the stream completes. Falls back to `onError` if the
   * connection drops.
   */
  chatStream: async (
    data: AIChatRequest,
    onChunk: (text: string) => void,
    onDone: (final: AIChatMessage) => void,
    onError: (err: any) => void,
  ) => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed: ${response.status}`);
      }
      const reader = (response.body as any).getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalMsg: AIChatMessage | null = null;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE frames are separated by blank line
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        for (const ev of events) {
          const line = ev.trim();
          if (!line) continue;
          // Format: "event: chunk" or "event: done" followed by "data: ..."
          const eventMatch = line.match(/^event:\s*(\S+)/);
          const dataMatch = line.match(/^data:\s*([\s\S]+)$/m);
          if (!eventMatch || !dataMatch) continue;
          const eventName = eventMatch[1];
          const raw = dataMatch[1].trim();
          if (eventName === 'chunk') {
            try {
              // data is a JSON string (escaped), so parse it
              const text = JSON.parse(raw);
              onChunk(text);
            } catch {
              onChunk(raw);
            }
          } else if (eventName === 'done') {
            try {
              finalMsg = JSON.parse(raw);
            } catch { /* ignore */ }
          } else if (eventName === 'error') {
            onError(new Error(raw));
            return;
          }
        }
      }
      if (finalMsg) onDone(finalMsg);
      else onError(new Error('Stream ended without a final message'));
    } catch (e) {
      onError(e);
    }
  },
};

// =========== NOTIFICATIONS ===========
export const notificationsApi = {
  getAll: (page: number = 0, size: number = 20) =>
    apiClient.get<{ success: boolean; data: PageResponse<Notification> }>(`/notifications?page=${page}&size=${size}`),
  getUnread: () =>
    apiClient.get<{ success: boolean; data: Notification[] }>('/notifications/unread'),
  getUnreadCount: () =>
    apiClient.get<{ success: boolean; data: number }>('/notifications/unread/count'),
  markAsRead: (id: number) =>
    apiClient.put<{ success: boolean }>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    apiClient.put<{ success: boolean }>('/notifications/read-all'),
};

// =========== MEDICAL ===========
export const allergiesApi = {
  getForChild: (childId: number) =>
    apiClient.get<{ success: boolean; data: Allergy[] }>(`/allergies/child/${childId}`),
  getCritical: (childId: number) =>
    apiClient.get<{ success: boolean; data: Allergy[] }>(`/allergies/child/${childId}/critical`),
  add: (childId: number, data: Partial<Allergy>) =>
    apiClient.post<{ success: boolean; data: Allergy }>(`/allergies/child/${childId}`, data),
  update: (id: number, data: Partial<Allergy>) =>
    apiClient.put<{ success: boolean; data: Allergy }>(`/allergies/${id}`, data),
  delete: (id: number) => apiClient.delete(`/allergies/${id}`),
};

export const medicationsApi = {
  getForChild: (childId: number) =>
    apiClient.get<{ success: boolean; data: Medication[] }>(`/medications/child/${childId}`),
  getActive: (childId: number) =>
    apiClient.get<{ success: boolean; data: Medication[] }>(`/medications/child/${childId}/active`),
  add: (childId: number, data: Partial<Medication>) =>
    apiClient.post<{ success: boolean; data: Medication }>(`/medications/child/${childId}`, data),
  update: (id: number, data: Partial<Medication>) =>
    apiClient.put<{ success: boolean; data: Medication }>(`/medications/${id}`, data),
  discontinue: (id: number) =>
    apiClient.put<{ success: boolean; data: Medication }>(`/medications/${id}/discontinue`),
};

export const diagnosesApi = {
  getForChild: (childId: number) =>
    apiClient.get<{ success: boolean; data: Diagnosis[] }>(`/diagnoses/child/${childId}`),
  add: (childId: number, data: Partial<Diagnosis>) =>
    apiClient.post<{ success: boolean; data: Diagnosis }>(`/diagnoses/child/${childId}`, data),
  update: (id: number, data: Partial<Diagnosis>) =>
    apiClient.put<{ success: boolean; data: Diagnosis }>(`/diagnoses/${id}`, data),
};

// =========== ADMIN ===========
export const adminApi = {
  // Users
  getUsers: (params?: { role?: string; active?: boolean; query?: string }) =>
    apiClient.get<{ success: boolean; data: PageResponse<User> }>('/admin/users', { params }),
  createUser: (data: RegisterRequest & { roles: string[] }) =>
    apiClient.post<{ success: boolean; data: User }>('/admin/users', data),
  // Audit logs
  getAuditLogs: (params?: { userId?: number; action?: string; from?: string; to?: string }) =>
    apiClient.get<{ success: boolean; data: PageResponse<AuditLog> }>('/admin/audit-logs', { params }),
  // System settings
  getSettings: () =>
    apiClient.get<{ success: boolean; data: SystemSettings }>('/admin/settings'),
  updateSettings: (data: Partial<SystemSettings>) =>
    apiClient.put<{ success: boolean; data: SystemSettings }>('/admin/settings', data),
  // System stats
  getStats: () =>
    apiClient.get<{ success: boolean; data: any }>('/admin/stats'),
  // Sync monitoring
  getSyncStatus: () =>
    apiClient.get<{ success: boolean; data: any }>('/admin/sync/status'),
  // Vaccine schedule catalog (EPI list, not per-child records)
  getVaccineSchedules: () =>
    apiClient.get<{ success: boolean; data: VaccinationSchedule[] }>('/admin/vaccine-schedules'),
  createVaccineSchedule: (data: Partial<VaccinationSchedule>) =>
    apiClient.post<{ success: boolean; data: VaccinationSchedule }>('/admin/vaccine-schedules', data),
  updateVaccineSchedule: (id: number, data: Partial<VaccinationSchedule>) =>
    apiClient.put<{ success: boolean; data: VaccinationSchedule }>(`/admin/vaccine-schedules/${id}`, data),
  activateVaccineSchedule: (id: number) =>
    apiClient.put<{ success: boolean; data: VaccinationSchedule }>(`/admin/vaccine-schedules/${id}/activate`),
  deactivateVaccineSchedule: (id: number) =>
    apiClient.put<{ success: boolean; data: VaccinationSchedule }>(`/admin/vaccine-schedules/${id}/deactivate`),
};

// =========== REPORTS ===========
export const reportsApi = {
  getChildHealthSummary: (childId: number) =>
    apiClient.get(`/reports/child/${childId}/health-summary`),
  getClinicReport: (params?: { from?: string; to?: string }) =>
    apiClient.get('/reports/clinic', { params }),
  getVaccinationCoverage: (region?: string) =>
    apiClient.get('/reports/vaccination-coverage', { params: { region } }),
};
