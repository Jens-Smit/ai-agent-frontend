import client from './client';

// FIX: Die Funktion confirmWorkflowStep muss das 'confirmed' Attribut
// im JSON-Body senden, da der Server dies erwartet.

/**
 * Bestätigt oder lehnt einen wartenden Workflow-Step ab.
 * @param {number} workflowId - Die ID des Workflows.
 * @param {boolean} confirmed - Bestätigung (true) oder Ablehnung (false).
 */
export const confirmWorkflowStep = async (workflowId, confirmed) => {
  // Das Payload-Objekt muss den Schlüssel 'confirmed' enthalten,
  // um den 400 Bad Request Fehler zu vermeiden.
  const payload = {
    confirmed: confirmed
  };
  
  const response = await client.post(`/api/workflow/confirm/${workflowId}`, payload);
  return response.data;
};


// -- Weitere Funktionen (für die Vollständigkeit der Imports) --

export const createWorkflow = async (userIntent, sessionId, userId) => {
  const response = await client.post('/api/workflow/create', { 
    // Der Controller erwartet diese Schlüssel
    intent: userIntent, 
    sessionId: sessionId,
    
    // user_id wurde in Ihrem Controller-Code nicht verwendet, 
    // aber wir behalten es hier für andere Logik bei
    user_id: userId 
  });
  return response.data;
};

export const listWorkflows = async (status, limit) => {
  const params = {};
  if (status) params.status = status;
  if (limit) params.limit = limit;
  const response = await client.get('/api/workflow/list', { params });
  return response.data;
};

export const getWorkflowStatus = async (sessionId) => {
  const response = await client.get(`/api/workflow/status/${sessionId}`);
  return response.data;
};

export const getWorkflowCapabilities = async () => {
  const response = await client.get('/api/workflow/capabilities');
  return response.data;
};

export const cancelWorkflow = async (workflowId) => {
  // Annahme: Cancel verwendet einen einfachen POST
  const response = await client.post(`/api/workflow/cancel/${workflowId}`);
  return response.data;
};

export const deleteWorkflow = async (workflowId) => {
  // Annahme: Delete verwendet einen DELETE
  const response = await client.delete(`/api/workflow/${workflowId}`);
  return response.data;
};

// Dummy-Hook, da der Code nicht bereitgestellt wurde
export const useWorkflow = () => ({
  workflow: null,
  startWorkflow: () => console.log('Workflow started (dummy)'),
  isLoading: false,
});