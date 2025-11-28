import apiClient from '../client';

export const knowledgeService = {
  // List all knowledge documents
  listKnowledge: async () => {
    const response = await apiClient.get('/api/knowledge');
    return response.data;
  },

  // Create new knowledge document
  createKnowledge: async (title, content, tags = null) => {
    const response = await apiClient.post('/api/knowledge', {
      title,
      content,
      tags,
    });
    return response.data;
  },

  // Search knowledge base
  searchKnowledge: async (query, limit = 5, minScore = 0.3) => {
    const response = await apiClient.post('/api/knowledge/search', {
      query,
      limit,
      min_score: minScore,
    });
    return response.data;
  },

  // Get single knowledge document
  getKnowledge: async (knowledgeId) => {
    const response = await apiClient.get(`/api/knowledge/${knowledgeId}`);
    return response.data;
  },

  // Update knowledge document
  updateKnowledge: async (knowledgeId, updates) => {
    const response = await apiClient.put(`/api/knowledge/${knowledgeId}`, updates);
    return response.data;
  },

  // Delete knowledge document
  deleteKnowledge: async (knowledgeId) => {
    const response = await apiClient.delete(`/api/knowledge/${knowledgeId}`);
    return response.data;
  },

  // Get knowledge base stats
  getKnowledgeStats: async () => {
    const response = await apiClient.get('/api/knowledge/stats');
    return response.data;
  },

  // Index knowledge base (Admin)
  indexKnowledgeBase: async () => {
    const response = await apiClient.post('/api/index-knowledge');
    return response.data;
  },
};