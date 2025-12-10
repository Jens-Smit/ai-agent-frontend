// src/api/services/workflowService.js
import apiClient from '../client';

export const workflowService = {
  // === Workflow Lifecycle ===

  /**
   * Erstellt einen neuen Workflow-Entwurf
   */
  createWorkflow: async (intent, sessionId = null, options = {}) => {
    const response = await apiClient.post('/api/workflow/create', {
      intent,
      sessionId: sessionId || `session_${Date.now()}`,
      requiresApproval: options.requiresApproval ?? true,
      saveAsTemplate: options.saveAsTemplate ?? false,
      templateName: options.templateName,
    });
    return response.data;
  },

  /**
   * Genehmigt und startet einen Workflow
   */
  approveWorkflow: async (workflowId) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/approve`);
    return response.data;
  },

  /**
   * Führt einen Workflow erneut aus (Replay)
   */
  executeWorkflow: async (workflowId) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/execute`);
    return response.data;
  },

  /**
   * Löscht einen Workflow
   */
  deleteWorkflow: async (workflowId) => {
    const response = await apiClient.delete(`/api/workflow/${workflowId}`);
    return response.data;
  },

  /**
   * Konfiguriert Workflow-Zeitplan
   */
  scheduleWorkflow: async (workflowId, scheduleConfig) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/schedule`, scheduleConfig);
    return response.data;
  },
  /**
   * NEU: Startet einen fehlgeschlagenen Workflow neu
   */
  restartWorkflow: async (workflowId, options = { reset_failed_steps: true }) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/restart`, options);
    return response.data;
  },
  /**
 * Wählt einen Job für einen wartenden Decision-Step im Workflow
 * @param {number} workflowId - Die ID des Workflows
 * @param {string} selectedJobrefnr - Der vom Benutzer ausgewählte Job/Ergebnis
 */
  selectJob: async (workflowId, selectedJobrefnr) => {
    // Der Pfad `/api/workflow/` wird angenommen, basierend auf den bestehenden Endpunkten
    const response = await apiClient.post(`/api/workflow/${workflowId}/select-job`, { 
      selected_job: selectedJobrefnr 
    });
    return response.data;
  },
  /**
   * NEU: Injiziert den User-Kontext (Auth) in einen wartenden Workflow
   */
  injectUserContext: async (workflowId) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/inject-user-context`);
    return response.data;
  },

  // === Workflow Abfragen ===

  /**
   * Listet alle Workflows des Users
   */
  listWorkflows: async (status = null, limit = 50) => {
    const params = { limit };
    if (status) params.status = status;
    const response = await apiClient.get('/api/workflow/list', { params });
    return response.data;
  },

  /**
   * Holt Details eines Workflows
   */
  getWorkflowDetails: async (workflowId) => {
    const response = await apiClient.get(`/api/workflow/${workflowId}`);
    return response.data;
  },

  /**
   * Holt Status eines Workflows mit allen Steps
   */
  getWorkflowStatus: async (workflowId) => {
    const response = await apiClient.get(`/api/workflow/status/${workflowId}`);
    return response.data;
  },

  // === User Interaktion ===

  /**
   * Beantwortet eine User-Interaktion
   */
  resolveInteraction: async (workflowId, resolution) => {
    const response = await apiClient.post(
      `/api/workflow/${workflowId}/resolve-interaction`, 
      { resolution }
    );
    return response.data;
  },

  /**
   * Bestätigt einen wartenden Step
   */
  confirmStep: async (workflowId, confirmed) => {
    const response = await apiClient.post(`/api/workflow/confirm/${workflowId}`, {
      confirmed
    });
    return response.data;
  },

  // === E-Mail Management ===

  /**
   * Holt ausstehende E-Mails eines Workflows
   */
  getPendingEmails: async (workflowId) => {
    const response = await apiClient.get(`/api/workflow/${workflowId}/pending-emails`);
    return response.data;
  },

  /**
   * Holt E-Mail-Details eines Steps
   */
  getStepEmail: async (stepId) => {
    const response = await apiClient.get(`/api/workflow/step/${stepId}/email`);
    return response.data;
  },

  /**
   * Holt vollständigen E-Mail-Body
   */
  getStepEmailBody: async (stepId) => {
    const response = await apiClient.get(`/api/workflow/step/${stepId}/email-body`);
    return response.data;
  },

  /**
   * Sendet eine vorbereitete E-Mail
   */
  sendEmail: async (stepId) => {
    const response = await apiClient.post(`/api/workflow/step/${stepId}/send-email`);
    return response.data;
  },

  /**
   * Lehnt eine E-Mail ab
   */
  rejectEmail: async (stepId) => {
    const response = await apiClient.post(`/api/workflow/step/${stepId}/reject-email`);
    return response.data;
  },

  /**
   * Lädt einen E-Mail-Anhang herunter
   */
  downloadAttachment: async (stepId, attachmentId) => {
    const response = await apiClient.get(
      `/api/workflow/step/${stepId}/attachment/${attachmentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Zeigt Anhang-Vorschau
   */
  previewAttachment: async (stepId, attachmentId) => {
    const response = await apiClient.get(
      `/api/workflow/step/${stepId}/attachment/${attachmentId}/preview`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // === Step Management ===

  /**
   * Holt Details eines einzelnen Steps
   */
  getStep: async (stepId) => {
    const response = await apiClient.get(`/api/workflow/step/${stepId}`);
    return response.data;
  },

  /**
   * Aktualisiert einen Step
   */
  updateStep: async (stepId, stepData) => {
    const response = await apiClient.patch(`/api/workflow/step/${stepId}`, stepData);
    return response.data;
  },

  /**
   * Löscht einen Step
   */
  deleteStep: async (stepId) => {
    const response = await apiClient.delete(`/api/workflow/step/${stepId}`);
    return response.data;
  },

  /**
   * Erstellt einen neuen Step
   */
  createStep: async (workflowId, stepData) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/steps`, stepData);
    return response.data;
  },

  /**
   * Ändert die Reihenfolge von Steps
   */
  reorderSteps: async (workflowId, stepOrder) => {
    const response = await apiClient.post(`/api/workflow/${workflowId}/steps/reorder`, {
      step_order: stepOrder
    });
    return response.data;
  },

  // === System ===

  /**
   * Holt verfügbare Tools/Capabilities
   */
  getCapabilities: async () => {
    const response = await apiClient.get('/api/workflow/capabilities');
    return response.data;
  },
};

export default workflowService;