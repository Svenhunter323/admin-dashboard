import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL: "http://localhost:5000", // Replace with your actual API base URL
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (credentials) => api.post('/api/admin/login', credentials),
  getStats: () => api.get('/api/admin/stats'),
  getAnalytics: (day) => api.get('/api/admin/analytics', { params: { day } }),
  getUsers: () => api.get('/api/admin/users'),
  banUser: (id) => api.patch(`/api/admin/users/${id}/ban`),
  unbanUser: (id) => api.patch(`/api/admin/users/${id}/unban`),
  getBets: (limit = 100) => api.get('/api/admin/bets', { params: { limit } }),
};

export default api;