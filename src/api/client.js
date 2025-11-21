import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 150000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// refresh handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ Request Interceptor: Token anhängen
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // debug output — wichtig!
    console.log('[API Interceptor] token present:', !!token);
    console.log('[API Interceptor] outgoing headers:', config.headers);
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const skipRefreshFor = [
      '/api/login',
      '/api/register',
      '/api/token/refresh',
      '/api/password/'
    ];

    const shouldSkipRefresh = skipRefreshFor.some(path =>
      originalRequest.url?.includes(path)
    );

    if (shouldSkipRefresh) return Promise.reject(error);

    // Token abgelaufen
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[API] Trying refresh');

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token stored');

        const refreshResponse = await apiClient.post('/api/token/refresh', {
          refresh_token: refreshToken
        });

        const newAccess = refreshResponse.data.access_token;
        const newRefresh = refreshResponse.data.refresh_token;

        if (newAccess) {
          localStorage.setItem('access_token', newAccess);
        }

        if (newRefresh) {
          localStorage.setItem('refresh_token', newRefresh);
        }

        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        isRefreshing = false;

        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('[API] Token refresh failed');

        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.violations) return error.response.data.violations.join(', ');
  if (error.message) return error.message;
  return 'Unbekannter Fehler';
};

export default apiClient;
