import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Flag um Redirect-Schleife zu verhindern
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor mit besserer Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verhindere Refresh bei bestimmten Endpoints
    const skipRefreshFor = ['/api/login', '/api/register', '/api/token/refresh', '/api/password/'];
    const shouldSkipRefresh = skipRefreshFor.some(path => originalRequest.url?.includes(path));

    if (shouldSkipRefresh) {
      return Promise.reject(error);
    }

    // Token abgelaufen - Refresh versuchen
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Verhindere mehrfache gleichzeitige Refresh-Requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[API] Attempting token refresh...');
        await apiClient.post('/api/token/refresh', {}); // baseURL und withCredentials werden automatisch übernommen
        
        console.log('[API] Token refresh successful');
        processQueue(null);
        isRefreshing = false;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // ❌ WICHTIG: Redirect nur wenn wir nicht schon auf /login sind
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // Clear alle Cookies (falls vorhanden aber ungültig)
          document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Error Message Extraktor
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.violations) return error.response.data.violations.join(', ');
  if (error.message) return error.message;
  return 'Ein unbekannter Fehler ist aufgetreten';
};

export default apiClient;