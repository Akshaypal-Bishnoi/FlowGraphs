import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowgraphs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to auth if unauthorized
      localStorage.removeItem('flowgraphs_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
