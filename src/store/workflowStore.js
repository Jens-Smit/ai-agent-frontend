import { create } from 'zustand';
import { workflowService } from '../api/services/workflowService';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  //pendingEmails: [],
  isLoading: false,
  error: null,

  // Erstellt neuen Workflow
  createWorkflow: async (intent, sessionId = null) => {
    set({ isLoading: true, error: null });
    try {
      const data = await workflowService.createWorkflow(intent, sessionId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler beim Erstellen',
        isLoading: false 
      });
      throw error;
    }
  },
  // Holt einzelnen Workflow
  fetchWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await workflowService.getWorkflowStatus(workflowId);
      set({ currentWorkflow: data, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler beim Laden',
        isLoading: false 
      });
      throw error;
    }
  },
  // Holt alle Workflows
  fetchWorkflows: async (status = null, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workflowService.listWorkflows(status, limit);
      set({ 
        workflows: response.workflows || [],
        isLoading: false 
      });
      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler beim Laden der Liste',
        isLoading: false 
      });
      throw error;
    }
  },
  // Startet Workflow neu
  restartWorkflow: async (workflowId, options) => {
    set({ isLoading: true, error: null });
    try {
      await workflowService.restartWorkflow(workflowId, options);
      await get().fetchWorkflow(workflowId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler beim Neustart',
        isLoading: false 
      });
      throw error;
    }
  },
  // Genehmigt und startet Workflow
  approveWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      await workflowService.approveWorkflow(workflowId);
      await get().fetchWorkflow(workflowId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler beim Starten',
        isLoading: false 
      });
      throw error;
    }
  },
  // Injiziert User-Kontext
  injectUserContext: async (workflowId) => {
    set({ isLoading: true, error: null });
    try {
      await workflowService.injectUserContext(workflowId);
      await get().fetchWorkflow(workflowId);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Fehler bei der Authentifizierung',
        isLoading: false 
      });
      throw error;
    }
  },
  // Fetch workflow status
  fetchWorkflowStatus: async (sessionId) => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await workflowService.getWorkflowStatus(sessionId);
      set({ 
        currentWorkflow: workflow,
        isLoading: false,
      });
      return workflow;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch workflow';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // List workflows
  fetchWorkflows: async (status = null, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workflowService.listWorkflows(status, limit);
      set({ 
        workflows: response.workflows,
        isLoading: false,
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch workflows';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch pending emails
  fetchPendingEmails: async (workflowId) => {
    try {
      const response = await workflowService.getPendingEmails(workflowId);
      set({ pendingEmails: response.pending_emails });
      return response;
    } catch (error) {
      console.error('Failed to fetch pending emails:', error);
      throw error;
    }
  },

  // Confirm workflow step
  confirmStep: async (workflowId, confirmed) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workflowService.confirmWorkflowStep(workflowId, confirmed);
      set({ isLoading: false });
      
      // Refresh workflow status
      if (get().currentWorkflow?.session_id) {
        await get().fetchWorkflowStatus(get().currentWorkflow.session_id);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to confirm step';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Send email
  sendEmail: async (stepId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workflowService.sendEmail(stepId);
      set({ isLoading: false });
      
      // Refresh workflow status
      if (get().currentWorkflow?.session_id) {
        await get().fetchWorkflowStatus(get().currentWorkflow.session_id);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send email';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Reject email
  rejectEmail: async (stepId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await workflowService.rejectEmail(stepId);
      set({ isLoading: false });
      
      // Refresh workflow status
      if (get().currentWorkflow?.session_id) {
        await get().fetchWorkflowStatus(get().currentWorkflow.session_id);
      }
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reject email';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Löscht Workflow
  deleteWorkflow: async (workflowId) => {
    try {
      await workflowService.deleteWorkflow(workflowId);
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== workflowId),
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Fehler beim Löschen' 
      };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));