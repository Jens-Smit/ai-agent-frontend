import { create } from 'zustand';
import { authService } from '../api/services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Login
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(email, password);
      const userResponse = await authService.getCurrentUser();
      
      set({
        user: userResponse.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      set({
        user: null,
        isAuthenticated: false,
      });
      return { success: false };
    }
  },

  // Register
  register: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register(email, password);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      set({ user: response.user });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));