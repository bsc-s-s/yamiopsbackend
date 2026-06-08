import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://yami-ops-backend.onrender.com/api/v1' : 'http://localhost:3001/api/v1');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenant_id');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['x-tenant-id'] = tenantId;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant_id');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dashboard = {
  resume: () => api.get('/dashboard/resume'),
  occupancyTimeline: (days = 30) => api.get(`/dashboard/occupancy-timeline?days=${days}`),
};

export const properties = {
  list: () => api.get('/properties'),
  get: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  rooms: {
    list: (propertyId) => api.get(`/properties/${propertyId}/rooms`),
    get: (propertyId, roomId) => api.get(`/properties/${propertyId}/rooms/${roomId}`),
    create: (propertyId, data) => api.post(`/properties/${propertyId}/rooms`, data),
    update: (propertyId, roomId, data) => api.put(`/properties/${propertyId}/rooms/${roomId}`, data),
    updateStatus: (propertyId, roomId, status) => api.put(`/properties/${propertyId}/rooms/${roomId}/status`, { status }),
  },
};

export const reservations = {
  list: (filters) => api.get('/reservations', { params: filters }),
  get: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  checkin: (id) => api.post(`/reservations/${id}/checkin`),
  checkout: (id) => api.post(`/reservations/${id}/checkout`),
  cancel: (id) => api.post(`/reservations/${id}/cancel`),
  delete: (id) => api.delete(`/reservations/${id}`),
  active: () => api.get('/reservations/active'),
  todayCheckouts: () => api.get('/reservations/today-checkouts'),
};

export const incidents = {
  list: (filters) => api.get('/incidents', { params: filters }),
  get: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  assign: (id, userId) => api.post(`/incidents/${id}/assign`, { user_id: userId }),
  resolve: (id) => api.post(`/incidents/${id}/resolve`),
  close: (id) => api.post(`/incidents/${id}/close`),
  delete: (id) => api.delete(`/incidents/${id}`),
};

export const finance = {
  list: (filters) => api.get('/finance', { params: filters }),
  get: (id) => api.get(`/finance/${id}`),
  create: (data) => api.post('/finance', data),
  update: (id, data) => api.put(`/finance/${id}`, data),
  delete: (id) => api.delete(`/finance/${id}`),
  summary: (dateFrom, dateTo) => api.get('/finance/summary', { params: { date_from: dateFrom, date_to: dateTo } }),
  dailyCash: (date) => api.get('/finance/daily-cash', { params: { date } }),
};

export const notifications = {
  list: (filters) => api.get('/notifications', { params: filters }),
  create: (data) => api.post('/notifications', data),
  send: (data) => api.post('/notifications/send', data),
  retry: (id) => api.post(`/notifications/${id}/retry`),
};

export const tenants = {
  list: () => api.get('/tenants'),
  get: (id) => api.get(`/tenants/${id}`),
  create: (data) => api.post('/tenants', data),
  update: (id, data) => api.put(`/tenants/${id}`, data),
  delete: (id) => api.delete(`/tenants/${id}`),
  stats: (id) => api.get(`/tenants/${id}/stats`),
};

export default api;
