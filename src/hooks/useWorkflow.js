// src/hooks/useWorkflow.js
import { useState, useEffect, useCallback } from 'react';
import { getWorkflowStatus } from '../api/workflow';

const POLL_INTERVAL = 3000; // 3 Sekunden

export const useWorkflow = (sessionId) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(!!sessionId);

  const fetchWorkflowStatus = useCallback(async () => {
    if (!sessionId || !isPolling) return;

    try {
      setLoading(true);
      const data = await getWorkflowStatus(sessionId);
      setWorkflow(data);
      
      // Stop polling wenn Workflow abgeschlossen oder fehlgeschlagen
      if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Workflow status polling error:', err);
      setError(err.message || 'Failed to fetch workflow status');
      setIsPolling(false);
    } finally {
      setLoading(false);
    }
  }, [sessionId, isPolling]);

  useEffect(() => {
    if (!isPolling || !sessionId) return;

    fetchWorkflowStatus();
    const interval = setInterval(fetchWorkflowStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isPolling, sessionId, fetchWorkflowStatus]);

  return {
    workflow,
    loading,
    error,
    isPolling,
    refresh: fetchWorkflowStatus,
    stopPolling: () => setIsPolling(false),
  };
};