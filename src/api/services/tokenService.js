import apiClient from '../client';

export const tokenService = {
  // Get token limits
  getLimits: async () => {
    const response = await apiClient.get('/api/tokens/limits');
    return response.data;
  },

  // Update token limits
  updateLimits: async (limits) => {
    const response = await apiClient.put('/api/tokens/limits', limits);
    return response.data;
  },

  // Get token usage statistics
  getUsage: async (period = null, startDate = null, endDate = null) => {
    const params = {};
    if (period) params.period = period;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await apiClient.get('/api/tokens/usage', { params });
    return response.data;
  },

  // Get usage history
  getUsageHistory: async (days = 30, model = null, agentType = null) => {
    const params = { days };
    if (model) params.model = model;
    if (agentType) params.agent_type = agentType;
    
    const response = await apiClient.get('/api/tokens/usage/history', { params });
    return response.data;
  },

  // Check if user has token capacity
  checkCapacity: async (estimatedTokens = 0) => {
    const response = await apiClient.get('/api/tokens/limits/check', {
      params: { estimated_tokens: estimatedTokens },
    });
    return response.data;
  },

  // Reset limits to defaults
  resetLimits: async () => {
    const response = await apiClient.post('/api/tokens/limits/reset');
    return response.data;
  },
};

export const userSettingsService = {
  // Get user settings
  getSettings: async () => {
    const response = await apiClient.get('/api/user/settings');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings) => {
    const response = await apiClient.put('/api/user/settings', settings);
    return response.data;
  },
};

export const systemService = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};