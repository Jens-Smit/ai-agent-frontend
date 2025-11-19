import { useState, useEffect, useCallback, useRef } from 'react';
import { pollAgentStatus } from '../api/agent';

const POLL_INTERVAL = 5000; // 5 Sekunden

export const useAgentStatus = (sessionId) => {
  const [statuses, setStatuses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(!!sessionId);
  const lastTimestampRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!sessionId || !isPolling) return;

    try {
      const params = {};
      
      // Nur wenn lastTimestamp existiert, als Query-Parameter senden
      if (lastTimestampRef.current) {
        params.since = lastTimestampRef.current; // ISO 8601 String
      }

      const data = await pollAgentStatus(sessionId, params.since);

      // Append neue Statuses
      if (data.statuses && data.statuses.length > 0) {
        setStatuses(prev => {
          const newStatuses = data.statuses.filter(
            s => !prev.some(existing => 
              existing.timestamp === s.timestamp && existing.message === s.message
            )
          );
          return [...prev, ...newStatuses];
        });
        
        // Update last timestamp (ISO String)
        const latest = data.statuses[data.statuses.length - 1];
        if (latest?.timestamp) {
          lastTimestampRef.current = latest.timestamp;
        }
      }

      // Check completion
      if (data.completed) {
        setCompleted(true);
        setIsPolling(false);
        if (data.result) setResult(data.result);
        if (data.error) setError(data.error);
      }
    } catch (err) {
      console.error('Status polling error:', err);
      setError(err.message || 'Status polling failed');
      setIsPolling(false);
    }
  }, [sessionId, isPolling]);

  useEffect(() => {
    if (!isPolling || !sessionId) return;

    // Initial fetch
    fetchStatus();

    // Setup polling
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isPolling, sessionId, fetchStatus]);

  return {
    statuses,
    completed,
    result,
    error,
    isPolling,
    stopPolling: () => setIsPolling(false),
  };
};