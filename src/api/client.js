import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';




const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Could implement token refresh logic here if needed
      // For now, redirect to login
      window.location.href = '/login';
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.error('Rate limited. Retry after:', retryAfter);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function for multipart/form-data requests
export const createFormDataClient = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};