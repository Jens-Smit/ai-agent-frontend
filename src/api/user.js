import apiClient from './client';

/**
 * Get User Settings (Email Configuration)
 */
export const getUserSettings = async () => {
  const response = await apiClient.get('/api/user/settings');
  return response.data;
};

/**
 * Update User Settings
 */
export const updateUserSettings = async (settings) => {
  const response = await apiClient.put('/api/user/settings', settings);
  return response.data;
};

/**
 * Get Current User Profile
 */
export const getUserProfile = async () => {
  const response = await apiClient.get('/api/user');
  return response.data;
};

/**
 * Update User Profile
 */
export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put('/api/user', profileData);
  return response.data;
};