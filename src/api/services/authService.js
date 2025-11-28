import apiClient from '../client';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/api/login', { email, password });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/api/logout');
    return response.data;
  },

  // Register
  register: async (email, password) => {
    const response = await apiClient.post('/api/register', { email, password });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/api/password/request-reset', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/api/password/reset', { 
      token, 
      newPassword 
    });
    return response.data;
  },

  // Change password (authenticated)
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/api/password/change', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Start Google OAuth flow
  connectGoogle: () => {
    window.location.href = `${apiClient.defaults.baseURL}/api/connect/google`;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/user');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await apiClient.put('/api/user', userData);
    return response.data;
  },
};