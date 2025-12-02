import axios from 'axios';
import { clearToken, isTokenExpired } from '@/lib/utils';
import { API_ENDPOINTS } from './endpoints';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public endpoints that don't require token validation
const publicEndpoints = [API_ENDPOINTS.login, API_ENDPOINTS.register];

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Skip token expiration check for public endpoints
    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      // Check if token is expired before making request
      if (isTokenExpired()) {
        clearToken();
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
