// src/api/user.js
import apiClient from './client';

/**
 * Aktuellen Benutzer abrufen
 */
export const getUserProfile = async () => {
  const response = await apiClient.get('/api/user');
  return response.data;
};

/**
 * Benutzerprofil aktualisieren
 */
export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put('/api/user', profileData);
  return response.data;
};

/**
 * E-Mail-Einstellungen abrufen
 */
export const getUserSettings = async () => {
  const response = await apiClient.get('/api/user/settings');
  return response.data;
};

/**
 * E-Mail-Einstellungen aktualisieren
 */
export const updateUserSettings = async (settings) => {
  const response = await apiClient.put('/api/user/settings', settings);
  return response.data;
};