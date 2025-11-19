import apiClient from './client';

const backendUrl = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000';

export const login = async (email, password) => {
  const response = await apiClient.post('/api/login', { email, password });
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post('/api/logout');
  } catch (error) {
    console.error('Logout failed:', error);
  }
  return { success: true };
};

export const register = async (email, password) => {
  const response = await apiClient.post('/api/register', { email, password });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await apiClient.post('/api/password/request-reset', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/api/password/reset', { token, newPassword });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post('/api/password/change', { currentPassword, newPassword });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/user');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await apiClient.put('/api/user', userData);
  return response.data;
};

// Google OAuth Start URL
export const getGoogleOAuthUrl = () => {
  return `${backendUrl}/api/connect/google`;
};