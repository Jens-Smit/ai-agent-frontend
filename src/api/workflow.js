import apiClient from './client';

/**
 * Create and start a new workflow
 */
export const createWorkflow = async (intent, sessionId) => {
  const response = await apiClient.post('/api/workflow/create', {
    intent,
    sessionId
  });
  return response.data;
};

/**
 * Get workflow status by session ID
 */
export const getWorkflowStatus = async (sessionId) => {
  const response = await apiClient.get(`/api/workflow/status/${sessionId}`);
  return response.data;
};

/**
 * Confirm or reject a workflow step
 */
export const confirmWorkflowStep = async (workflowId, confirmed) => {
  const response = await apiClient.post(`/api/workflow/confirm/${workflowId}`, {
    confirmed
  });
  return response.data;
};

/**
 * List all workflows
 */
export const listWorkflows = async (status = null, limit = 20) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  
  const response = await apiClient.get('/api/workflow/list', { params });
  return response.data;
};

/**
 * Get available workflow capabilities
 */
export const getWorkflowCapabilities = async () => {
  const response = await apiClient.get('/api/workflow/capabilities');
  return response.data;
};