import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const BACKEND_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not redirect if already on login or checking login credentials
      const currentUrl = error.config?.url || '';
      const isLoginRequest = currentUrl.includes('/auth/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('bookloop_token');
        localStorage.removeItem('bookloop_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
