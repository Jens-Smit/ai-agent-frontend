// src/api/knowledge.js
import apiClient from './client';

/**
 * Liste aller persönlichen Wissensdokumente
 */
export const listKnowledgeDocuments = async () => {
  const response = await apiClient.get('/api/knowledge');
  return response.data;
};

/**
 * Neues Wissensdokument erstellen
 */
export const createKnowledgeDocument = async (title, content, tags = null) => {
  const response = await apiClient.post('/api/knowledge', { title, content, tags });
  return response.data;
};

/**
 * Semantische Suche in der Knowledge Base
 */
export const searchKnowledge = async (query, limit = 5, minScore = 0.3) => {
  const response = await apiClient.post('/api/knowledge/search', {
    query,
    limit,
    min_score: minScore,
  });
  return response.data;
};

/**
 * Einzelnes Wissensdokument abrufen
 */
export const getKnowledgeDocument = async (id) => {
  const response = await apiClient.get(`/api/knowledge/${id}`);
  return response.data;
};

/**
 * Wissensdokument aktualisieren
 */
export const updateKnowledgeDocument = async (id, data) => {
  const response = await apiClient.put(`/api/knowledge/${id}`, data);
  return response.data;
};

/**
 * Wissensdokument löschen
 */
export const deleteKnowledgeDocument = async (id) => {
  const response = await apiClient.delete(`/api/knowledge/${id}`);
  return response.data;
};

/**
 * Statistiken zur persönlichen Knowledge Base
 */
export const getKnowledgeStats = async () => {
  const response = await apiClient.get('/api/knowledge/stats');
  return response.data;
};