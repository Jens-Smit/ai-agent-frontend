import apiClient from '../client';

export const agentService = {
  // Start Personal Assistant Agent
  startPersonalAssistant: async (prompt) => {
    const response = await apiClient.post('/api/agent/personal', { prompt });
    return response.data;
  },

  // Start Frontend Generator Agent
  startFrontendGenerator: async (prompt) => {
    const response = await apiClient.post('/api/agent/frontend', { prompt });
    return response.data;
  },

  // Get agent status
  getAgentStatus: async (sessionId, since = null) => {
    const params = since ? { since } : {};
    const response = await apiClient.get(`/api/agent/status/${sessionId}`, { params });
    return response.data;
  },

  // Poll agent status with interval
  pollAgentStatus: (sessionId, onUpdate, interval = 2000) => {
    let lastTimestamp = null;
    let timeoutId; // NEU: Zum Speichern der Timeout-ID
    
    const poll = async () => {
      try {
        const status = await agentService.getAgentStatus(sessionId, lastTimestamp);
        
        if (status.statuses && status.statuses.length > 0) {
          lastTimestamp = status.statuses[status.statuses.length - 1].timestamp;
        }
        
        onUpdate(status);
        
        // Polling stoppen, wenn die gesamte Agenten-Sitzung abgeschlossen oder fehlerhaft ist
        if (!status.completed && !status.error) {
          timeoutId = setTimeout(poll, interval); // Timeout-ID speichern
        }
      } catch (error) {
        console.error('Error polling agent status:', error);
        onUpdate({ error: error.message });
      }
    };
    
    poll();
    
    // NEU: Cleanup-Funktion zurückgeben
    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };
  },

};