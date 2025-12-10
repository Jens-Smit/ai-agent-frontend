/**
 * workflowStore.js - ZUSTAND STORE FÜR WORKFLOWS - VOLLSTÄNDIG OPTIMIERT
 * 
 * FEATURES:
 * - Vollständige Workflow-Lifecycle-Verwaltung
 * - Email-Management
 * - User-Context-Injection
 * - Optimistic Updates
 * - Error Recovery
 */

import { create } from 'zustand';
import { workflowService } from '../api/services/workflowService';

export const useWorkflowStore = create((set, get) => ({
  // ============================================
  // STATE
  // ============================================
  
  /** Liste aller Workflows */
  workflows: [],
  
  /** Aktuell angezeigter Workflow (Details-Seite) */
  currentWorkflow: null,

  /** Loading State */
  isLoading: false,
  
  /** Fehler */
  error: null,

  // ============================================
  // WORKFLOW LIFECYCLE ACTIONS
  // ============================================

  /**
   * Erstellt einen neuen Workflow
   * 
   * @param {string} intent - User-Intent
   * @param {string|null} sessionId - Optional: Session ID
   * @returns {Promise<Object>} Erstellter Workflow
   */
  createWorkflow: async (intent, sessionId = null) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await workflowService.createWorkflow(intent, sessionId);
      
      // Optimistic Update: Workflow sofort zur Liste hinzufügen
      set(state => ({
        workflows: [data, ...state.workflows],
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Erstellen';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Holt einen einzelnen Workflow mit allen Details
   * 
   * @param {number|string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow mit allen Steps
   */
  fetchWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    
    try {
      const id = typeof workflowId === 'string' ? parseInt(workflowId, 10) : workflowId;
      
      const data = await workflowService.getWorkflowStatus(id);
      
      // Update currentWorkflow UND workflows-Liste
      set(state => ({
        currentWorkflow: data,
        workflows: state.workflows.map(w => 
          w.id === data.id ? data : w
        ),
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Laden';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
  /**
  * Wählt einen Job für einen wartenden Decision-Step und fährt Workflow fort
  * * @param {number} workflowId - Workflow ID
  * @param {string} selectedJobrefnr - Der ausgewählte Job/Ergebnis
  * @returns {Promise<Object>} Success/Error Status
  */
  selectJob: async (workflowId, selectedJobrefnr) => {
    set({ isLoading: true, error: null });
    console.log('Store: selectJob aufgerufen mit:', workflowId, selectedJobrefnr);
    
    try {
      const data = await workflowService.selectJob(workflowId, selectedJobrefnr);
      
      // Workflow neu laden, um den aktualisierten Status und die nächsten Steps zu erhalten
      await get().fetchWorkflow(workflowId); 
      
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler bei der Job-Auswahl';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },
  /**
   * Holt Liste aller Workflows
   * 
   * @param {string|null} status - Filter nach Status
   * @param {number} limit - Max. Anzahl Workflows
   * @returns {Promise<Array>} Liste von Workflows
   */
  fetchWorkflows: async (status = null, limit = 50) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await workflowService.listWorkflows(status, limit);

      let workflowList = [];

      if (Array.isArray(response)) {
        workflowList = response;
      } else if (response && Array.isArray(response.workflows)) {
        workflowList = response.workflows;
      } else if (response && Array.isArray(response.data)) {
        workflowList = response.data;
      }

      set({ 
        workflows: workflowList,
        isLoading: false 
      });
      
      return workflowList;
    } catch (error) {
      console.error("Store: Fehler bei fetchWorkflows:", error);
      const errorMsg = error.response?.data?.message || 'Fehler beim Laden der Liste';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Genehmigt einen Draft-Workflow und startet ihn
   * 
   * @param {number} workflowId - Workflow ID
   * @returns {Promise<void>}
   */
  approveWorkflow: async (workflowId) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.approveWorkflow(workflowId);
      
      // Workflow neu laden
      await get().fetchWorkflow(workflowId);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Starten';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Startet einen fehlgeschlagenen Workflow neu
   * 
   * @param {number} workflowId - Workflow ID
   * @param {Object} options - Optionen für Neustart
   * @returns {Promise<void>}
   */
  restartWorkflow: async (workflowId, options = { reset_failed_steps: true }) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.restartWorkflow(workflowId, options);
      
      // Workflow neu laden
      await get().fetchWorkflow(workflowId);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Neustart';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Injiziert User-Kontext in wartenden Workflow
   * 
   * @param {number} workflowId - Workflow ID
   * @returns {Promise<void>}
   */
  injectUserContext: async (workflowId) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.injectUserContext(workflowId);
      
      // Workflow neu laden
      await get().fetchWorkflow(workflowId);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler bei der Authentifizierung';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Löscht einen Workflow
   * 
   * @param {number} workflowId - Workflow ID
   * @returns {Promise<Object>} Success/Error Status
   */
  deleteWorkflow: async (workflowId) => {
    try {
      await workflowService.deleteWorkflow(workflowId);
      
      // Optimistic Update: Sofort aus Liste entfernen
      set(state => ({
        workflows: state.workflows.filter(w => w.id !== workflowId),
        currentWorkflow: state.currentWorkflow?.id === workflowId ? null : state.currentWorkflow
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Löschen';
      set({ error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // ============================================
  // EMAIL ACTIONS
  // ============================================

  /**
   * Sendet eine vorbereitete E-Mail
   * 
   * @param {number} stepId - Step ID
   * @returns {Promise<Object>} Success/Error Status
   */
  sendEmail: async (stepId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await workflowService.sendEmail(stepId);
      
      // Workflow neu laden wenn currentWorkflow gesetzt ist
      if (get().currentWorkflow?.id) {
        await get().fetchWorkflow(get().currentWorkflow.id);
      }
      
      set({ isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Senden';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Lehnt eine vorbereitete E-Mail ab
   * 
   * @param {number} stepId - Step ID
   * @returns {Promise<Object>} Success/Error Status
   */
  rejectEmail: async (stepId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await workflowService.rejectEmail(stepId);
      
      // Workflow neu laden
      if (get().currentWorkflow?.id) {
        await get().fetchWorkflow(get().currentWorkflow.id);
      }
      
      set({ isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Ablehnen';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Holt ausstehende E-Mails eines Workflows
   * 
   * @param {number} workflowId - Workflow ID
   * @returns {Promise<Array>} Liste von E-Mails
   */
  getPendingEmails: async (workflowId) => {
    try {
      const response = await workflowService.getPendingEmails(workflowId);
      return response.pending_emails || [];
    } catch (error) {
      console.error('Fehler beim Laden ausstehender E-Mails:', error);
      return [];
    }
  },
  
  updateWorkflowData: (newWorkflowData) => set(state => ({
      // Stellen Sie sicher, dass alle benötigten Felder aktualisiert werden, 
      // z.B. steps, current_step, status.
      workflow: { ...state.workflow, ...newWorkflowData } 
  })),
  // ============================================
  // STEP MANAGEMENT
  // ============================================

  /**
   * Aktualisiert einen Step
   * 
   * @param {number} stepId - Step ID
   * @param {Object} stepData - Step Daten
   * @returns {Promise<void>}
   */
  updateStep: async (stepId, stepData) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.updateStep(stepId, stepData);
      
      // Workflow neu laden
      if (get().currentWorkflow?.id) {
        await get().fetchWorkflow(get().currentWorkflow.id);
      }
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Aktualisieren';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Erstellt einen neuen Step
   * 
   * @param {number} workflowId - Workflow ID
   * @param {Object} stepData - Step Daten
   * @returns {Promise<void>}
   */
  createStep: async (workflowId, stepData) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.createStep(workflowId, stepData);
      
      // Workflow neu laden
      await get().fetchWorkflow(workflowId);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Erstellen';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Löscht einen Step
   * 
   * @param {number} stepId - Step ID
   * @returns {Promise<void>}
   */
  deleteStep: async (stepId) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.deleteStep(stepId);
      
      // Workflow neu laden
      if (get().currentWorkflow?.id) {
        await get().fetchWorkflow(get().currentWorkflow.id);
      }
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Löschen';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  /**
   * Ändert die Reihenfolge von Steps
   * 
   * @param {number} workflowId - Workflow ID
   * @param {Array<number>} stepOrder - Neue Reihenfolge
   * @returns {Promise<void>}
   */
  reorderSteps: async (workflowId, stepOrder) => {
    set({ isLoading: true, error: null });
    
    try {
      await workflowService.reorderSteps(workflowId, stepOrder);
      
      // Workflow neu laden
      await get().fetchWorkflow(workflowId);
      
      set({ isLoading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Neuordnen';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // ============================================
  // UTILITY ACTIONS
  // ============================================

  /**
   * Löscht aktuelle Fehlermeldung
   */
  clearError: () => set({ error: null }),

  /**
   * Setzt currentWorkflow zurück
   */
  clearCurrentWorkflow: () => set({ currentWorkflow: null }),

  /**
   * Setzt den gesamten Store zurück
   */
  reset: () => set({
    workflows: [],
    currentWorkflow: null,
    isLoading: false,
    error: null
  })
}));