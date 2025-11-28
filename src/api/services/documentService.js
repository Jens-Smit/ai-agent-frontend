import apiClient, { createFormDataClient } from '../client';

export const documentService = {
  // List all documents
  listDocuments: async (category = null, type = null, limit = 50) => {
    const params = { limit };
    if (category) params.category = category;
    if (type) params.type = type;
    
    const response = await apiClient.get('/api/documents', { params });
    return response.data;
  },

  // Upload document
  uploadDocument: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.category) formData.append('category', options.category);
    if (options.display_name) formData.append('display_name', options.display_name);
    if (options.description) formData.append('description', options.description);
    if (options.tags) formData.append('tags', options.tags);
    if (options.index_to_knowledge !== undefined) {
      formData.append('index_to_knowledge', options.index_to_knowledge);
    }
    
    const formClient = createFormDataClient();
    const response = await formClient.post('/api/documents', formData);
    return response.data;
  },

  // Search documents
  searchDocuments: async (query, limit = 20) => {
    const response = await apiClient.get('/api/documents/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Get document details
  getDocument: async (documentId) => {
    const response = await apiClient.get(`/api/documents/${documentId}`);
    return response.data;
  },

  // Download document
  downloadDocument: async (documentId) => {
    const response = await apiClient.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Update document metadata
  updateDocument: async (documentId, updates) => {
    const response = await apiClient.put(`/api/documents/${documentId}`, updates);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/api/documents/${documentId}`);
    return response.data;
  },

  // Index document to knowledge base
  indexDocument: async (documentId, tags = null) => {
    const response = await apiClient.post(`/api/documents/${documentId}/index`, { tags });
    return response.data;
  },

  // Get storage stats
  getStorageStats: async () => {
    const response = await apiClient.get('/api/documents/storage/stats');
    return response.data;
  },
};