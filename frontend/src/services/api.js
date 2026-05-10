import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveloop_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('traveloop_token')
      localStorage.removeItem('traveloop_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  logout: ()     => api.post('/auth/logout'),
  getMe:  ()     => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteAccount: ()     => api.delete('/auth/profile'),
}

// ── Trips ─────────────────────────────────────────────────────
export const tripAPI = {
  getAll:  (params) => api.get('/trips', { params }),
  getById: (id)     => api.get(`/trips/${id}`),
  create:  (data)   => api.post('/trips', data),
  update:  (id, data) => api.put(`/trips/${id}`, data),
  delete:  (id)     => api.delete(`/trips/${id}`),
}

// ── Stops ─────────────────────────────────────────────────────
export const stopAPI = {
  add:     (data)   => api.post('/stops', data),
  update:  (id, data) => api.put(`/stops/${id}`, data),
  delete:  (id)     => api.delete(`/stops/${id}`),
  reorder: (stops)  => api.put('/stops/reorder', { stops }),
}

// ── Cities ────────────────────────────────────────────────────
export const cityAPI = {
  search:     (params) => api.get('/cities', { params }),
  getById:    (id)     => api.get(`/cities/${id}`),
  save:       (cityId) => api.post('/cities/saved', { city_id: cityId }),
  getSaved:   ()       => api.get('/cities/saved/list'),
  unsave:     (cityId) => api.delete(`/cities/saved/${cityId}`),
}

// ── Activities ────────────────────────────────────────────────
export const activityAPI = {
  getAll:    (params) => api.get('/activities', { params }),
  assign:    (data)   => api.post('/activities/assign', data),
  unassign:  (id)     => api.delete(`/activities/assign/${id}`),
}

// ── Budget ────────────────────────────────────────────────────
export const budgetAPI = {
  get:    (tripId) => api.get(`/budget/${tripId}`),
  update: (tripId, data) => api.put(`/budget/${tripId}`, data),
}

// ── Packing ───────────────────────────────────────────────────
export const packingAPI = {
  get:    (tripId) => api.get(`/packing/${tripId}`),
  add:    (data)   => api.post('/packing', data),
  update: (id, data) => api.put(`/packing/${id}`, data),
  delete: (id)     => api.delete(`/packing/${id}`),
  reset:  (tripId) => api.put(`/packing/reset/${tripId}`),
}

// ── Notes ─────────────────────────────────────────────────────
export const noteAPI = {
  get:    (tripId, params) => api.get(`/notes/${tripId}`, { params }),
  create: (data)           => api.post('/notes', data),
  update: (id, data)       => api.put(`/notes/${id}`, data),
  delete: (id)             => api.delete(`/notes/${id}`),
}

// ── Share ─────────────────────────────────────────────────────
export const shareAPI = {
  share:   (tripId) => api.post(`/share/${tripId}`),
  unshare: (tripId) => api.delete(`/share/${tripId}`),
  getPublic: (token) => api.get(`/share/view/${token}`),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
}

export default api
