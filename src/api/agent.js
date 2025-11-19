import apiClient from './client';

export const callPersonalAssistant = async (prompt) => {
  const response = await apiClient.post('/api/agent', { prompt }, {
    timeout: 10000,
  });
  return response.data;
};

export const callDevAgent = async (prompt) => {
  const response = await apiClient.post('/api/devAgent', { prompt }, {
    timeout: 10000,
  });
  return response.data;
};

export const callFrontendDevAgent = async (prompt) => {
  const response = await apiClient.post('/api/frondend_devAgent', { prompt }, {
    timeout: 10000,
  });
  return response.data;
};

export const pollAgentStatus = async (sessionId, since = null) => {
  const params = since ? { since } : {};
  const response = await apiClient.get(`/api/agent/status/${sessionId}`, { params });
  return response.data;
};

export const indexKnowledgeBase = async () => {
  const response = await apiClient.post('/api/index-knowledge');
  return response.data;
};