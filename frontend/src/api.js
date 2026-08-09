import axios from 'axios'

// Auto-detect the API URL:
//  1. Use VITE_API_URL from .env.local if set
//  2. Otherwise, in dev, try to use the same host the page is loaded from
//  3. Fall back to localhost:8080
function detectApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location
    // If the page is loaded from localhost, talk to localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//localhost:8080/api`
    }
    // Otherwise talk to the same host the page is on (assumes backend on same PC)
    return `${protocol}//${hostname}:8080/api`
  }
  return 'http://localhost:8080/api'
}

export const API_URL = detectApiUrl()

// Default export = the configured axios instance (so `import api from '../api'` works)
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s — fail fast on connection issues
})

export default api

export const apiClient = api

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto refresh on 401
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('mc_refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh })
          if (res.data?.data?.accessToken) {
            localStorage.setItem('mc_access_token', res.data.data.accessToken)
            original.headers.Authorization = `Bearer ${res.data.data.accessToken}`
            return apiClient(original)
          }
        } catch (e) {
          localStorage.removeItem('mc_access_token')
          localStorage.removeItem('mc_refresh_token')
          localStorage.removeItem('mc_user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

const ok = (r) => r.data?.data
const err = (e) => {
  // Friendlier error messages
  if (e.code === 'ECONNABORTED') {
    throw new Error(`Backend not reachable at ${API_URL}. Make sure the backend is running.`)
  }
  if (e.message === 'Network Error' || !e.response) {
    throw new Error(`Cannot connect to backend at ${API_URL}. Check that:\n• Backend is running (mvn spring-boot:run)\n• CORS is enabled\n• The URL is correct`)
  }
  const msg = e?.response?.data?.message || e?.message || 'Request failed'
  throw new Error(msg)
}

export const authApi = {
  login: async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      return ok(res)
    } catch (e) { err(e) }
  },
  register: async (data) => {
    try {
      const res = await apiClient.post('/auth/register', data)
      return ok(res)
    } catch (e) { err(e) }
  },
  me: async () => {
    try {
      const res = await apiClient.get('/auth/me')
      return ok(res)
    } catch (e) { err(e) }
  },
  logout: async () => {
    try { await apiClient.post('/auth/logout') } catch {}
  },
}

export const doctorApi = {
  getAll: async (params) => {
    try { return ok(await apiClient.get('/doctors', { params })) } catch (e) { err(e) }
  },
  getById: async (id) => {
    try { return ok(await apiClient.get(`/doctors/${id}`)) } catch (e) { err(e) }
  },
  myPatients: async () => {
    try { return ok(await apiClient.get('/doctors/me/patients')) } catch (e) { err(e) }
  },
  myAppointments: async () => {
    try { return ok(await apiClient.get('/doctors/me/appointments')) } catch (e) { err(e) }
  },
  updateAvailability: async (isOnDuty) => {
    try { return ok(await apiClient.put('/doctors/me/availability', { isOnDuty })) } catch (e) { err(e) }
  },
}

export const patientApi = {
  getAll: async () => {
    try { return ok(await apiClient.get('/children')) } catch (e) { err(e) }
  },
  getById: async (id) => {
    try { return ok(await apiClient.get(`/children/${id}`)) } catch (e) { err(e) }
  },
}

export const appointmentApi = {
  getAll: async () => {
    try { return ok(await apiClient.get('/appointments')) } catch (e) { err(e) }
  },
  getById: async (id) => {
    try { return ok(await apiClient.get(`/appointments/${id}`)) } catch (e) { err(e) }
  },
  confirm: async (id) => {
    try { return ok(await apiClient.put(`/appointments/${id}/confirm`)) } catch (e) { err(e) }
  },
  start: async (id) => {
    try { return ok(await apiClient.put(`/appointments/${id}/start`)) } catch (e) { err(e) }
  },
  complete: async (id, notes) => {
    try { return ok(await apiClient.put(`/appointments/${id}/complete`, { notes })) } catch (e) { err(e) }
  },
  cancel: async (id, reason) => {
    try { return ok(await apiClient.put(`/appointments/${id}/cancel`, { reason })) } catch (e) { err(e) }
  },
}

export const vaccinationApi = {
  schedules: async () => {
    try { return ok(await apiClient.get('/vaccinations/schedules/active')) } catch (e) { err(e) }
  },
  forChild: async (childId) => {
    try { return ok(await apiClient.get(`/vaccinations/child/${childId}`)) } catch (e) { err(e) }
  },
  overdue: async () => {
    try { return ok(await apiClient.get('/vaccinations/overdue')) } catch (e) { err(e) }
  },
  record: async (childId, data) => {
    try { return ok(await apiClient.post(`/vaccinations/child/${childId}`, data)) } catch (e) { err(e) }
  },
}

export const growthApi = {
  forChild: async (childId) => {
    try { return ok(await apiClient.get(`/growth/child/${childId}`)) } catch (e) { err(e) }
  },
  add: async (childId, data) => {
    try { return ok(await apiClient.post(`/growth/child/${childId}`, data)) } catch (e) { err(e) }
  },
}

export const medicationApi = {
  forChild: async (childId) => {
    try { return ok(await apiClient.get(`/medications/child/${childId}`)) } catch (e) { err(e) }
  },
  create: async (childId, data) => {
    try { return ok(await apiClient.post(`/medications/child/${childId}`, data)) } catch (e) { err(e) }
  },
}

// Unwrap a paginated response (`{ content, totalElements, ... }`) to its array.
// Falls back to the value as-is if it isn't a page wrapper.
const unwrapPage = (v) => {
  if (v && Array.isArray(v.content)) return v.content
  return v
}

export const userApi = {
  getAll: async (params) => {
    try { return unwrapPage(ok(await apiClient.get('/users', { params }))) } catch (e) { err(e) }
  },
  getById: async (id) => {
    try { return ok(await apiClient.get(`/users/${id}`)) } catch (e) { err(e) }
  },
  create: async (data) => {
    // Use /admin/users (admin-only) so audit logging fires on the
    // backend (the /users POST endpoint does not write audit).
    try { return ok(await apiClient.post('/admin/users', data)) } catch (e) { err(e) }
  },
  update: async (id, data) => {
    try { return ok(await apiClient.put(`/users/${id}`, data)) } catch (e) { err(e) }
  },
  activate: async (id) => {
    try { return ok(await apiClient.put(`/admin/users/${id}/activate`)) } catch (e) { err(e) }
  },
  deactivate: async (id) => {
    try { return ok(await apiClient.put(`/admin/users/${id}/deactivate`)) } catch (e) { err(e) }
  },
  delete: async (id) => {
    // Use /admin/users/{id} for delete (admin-only, audited)
    try { return ok(await apiClient.delete(`/admin/users/${id}`)) } catch (e) { err(e) }
  },
  assignRole: async (id, role) => {
    try { return ok(await apiClient.post(`/admin/users/${id}/roles`, { role })) } catch (e) { err(e) }
  },
  removeRole: async (id, role) => {
    try { return ok(await apiClient.delete(`/admin/users/${id}/roles/${role}`)) } catch (e) { err(e) }
  },
}

export const facilityApi = {
  getAll: async (params) => {
    try { return unwrapPage(ok(await apiClient.get('/facilities', { params }))) } catch (e) { err(e) }
  },
  getById: async (id) => {
    try { return ok(await apiClient.get(`/facilities/${id}`)) } catch (e) { err(e) }
  },
}

export const auditApi = {
  getAll: async (params) => {
    try { return unwrapPage(ok(await apiClient.get('/audit', { params }))) } catch (e) { err(e) }
  },
}

export const analyticsApi = {
  providerDashboard: async () => {
    try { return ok(await apiClient.get('/analytics/provider-dashboard')) } catch (e) { err(e) }
  },
  population: async () => {
    try { return ok(await apiClient.get('/analytics/population')) } catch (e) { err(e) }
  },
}
