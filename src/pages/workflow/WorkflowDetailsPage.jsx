/**
 * WorkflowDetailsPage.jsx - WORKFLOW DETAIL VIEW - VOLLSTÄNDIG ÜBERARBEITET
 * * FEATURES:
 * - Auto-Polling mit intelligentem Management
 * - Vollständige Workflow-Steuerung
 * - Detaillierte Fortschrittsanzeige
 * - Error Recovery
 * - User Context Injection
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Chip, 
  IconButton, 
  Alert, 
  CircularProgress,
  LinearProgress,
  Divider,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  Delete, 
  PlayArrow, 
  Replay,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '../../store/workflowStore';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';

export default function WorkflowDetailsPage() {
  const { id } = useParams(); // <-- Hier ist die ID
  const navigate = useNavigate();
  
  // Store
  const { 
    currentWorkflow, 
    fetchWorkflow, 
    approveWorkflow, 
    restartWorkflow, 
    deleteWorkflow,
    isLoading,
    error 
  } = useWorkflowStore();

  // Local State
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Refs für Polling-Management
  const pollIntervalRef = useRef(null);
  const isPollingRef = useRef(false);
  const isMountedRef = useRef(true);

  // NOTE: Geänderter Alert-Typ, da confirm() im iframe nicht funktioniert
  const showConfirm = (message) => {
    // In einer realen App wäre dies ein Modal/Dialog
    return window.confirm(message);
  }

  /**
   * Prüft ob Workflow aktiv ist und polling benötigt
   */
  const shouldPoll = useCallback((workflow) => {
    if (!workflow) return false;
    
    // Status, die ständige Aktualisierung benötigen
    return ['running', 'waiting_user_input', 'waiting_confirmation'].includes(
      workflow.status
    );
  }, []);

  /**
   * Stoppt Polling sicher
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    isPollingRef.current = false;
    setIsPolling(false);
  }, []);

  /**
   * Startet Polling
   */
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    setIsPolling(true);
    
    pollIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        stopPolling();
        return;
      }

      try {
        if (!id) return;
        
        const workflow = await fetchWorkflow(id);
        setLastUpdate(new Date());
        
        if (!shouldPoll(workflow)) {
          stopPolling();
        }
      } catch (error) {
        console.error('Polling Fehler:', error);
        if (isMountedRef.current) {
          stopPolling();
        }
      }
    }, 10000);
  }, [id, fetchWorkflow, shouldPoll, stopPolling]);

  /**
   * Effect: Initial Load & Polling Setup
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (!id) return;

    const loadWorkflow = async () => {
      try {
        const workflow = await fetchWorkflow(id);
        setLastUpdate(new Date());
        
        if (shouldPoll(workflow)) {
          startPolling();
        }
      } catch (error) {
        console.error('Fehler beim Laden:', error);
      }
    };

    loadWorkflow();

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [id, fetchWorkflow, shouldPoll, startPolling, stopPolling]);

  /**
   * Handler: Workflow genehmigen und starten
   */
  const handleApprove = async () => {
    if (!id) return;
    
    try {
      await approveWorkflow(id);
      if (shouldPoll(currentWorkflow)) {
        startPolling();
      }
    } catch (error) {
      console.error('Fehler beim Starten:', error);
    }
  };

  /**
   * Handler: Workflow neu starten
   */
  const handleRestart = async () => {
    if (!id) return;
    
    if (!showConfirm('Workflow ab dem Fehler neu starten?')) return;
    
    try {
      await restartWorkflow(id, { reset_failed_steps: true });
      if (shouldPoll(currentWorkflow)) {
        startPolling();
      }
    } catch (error) {
      console.error('Fehler beim Neustart:', error);
    }
  };

  /**
   * Handler: Workflow löschen
   */
  const handleDelete = async () => {
    if (!id) return;
    
    if (!showConfirm('Workflow wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      stopPolling();
      await deleteWorkflow(id);
      navigate('/workflows');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  /**
   * Handler: Manueller Refresh
   */
  const handleRefresh = async () => {
    if (!id) return;
    
    try {
      const workflow = await fetchWorkflow(id);
      setLastUpdate(new Date());
      
      if (shouldPoll(workflow) && !isPollingRef.current) {
        startPolling();
      } else if (!shouldPoll(workflow) && isPollingRef.current) {
        stopPolling();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  /**
   * Helper: Status Farbe
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'running': return 'info';
      case 'pending': return 'warning';
      case 'waiting_confirmation': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  /**
   * Helper: Status Label
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'running': return 'Läuft';
      case 'pending': return 'Auth erforderlich';
      case 'waiting_confirmation': return 'Bestätigung erforderlich';
      case 'completed': return 'Abgeschlossen';
      case 'failed': return 'Fehlgeschlagen';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  /**
   * Helper: Fortschritt berechnen
   */
  const getProgress = () => {
    if (!currentWorkflow?.steps || currentWorkflow.steps.length === 0) return 0;
    const completedSteps = currentWorkflow.steps.filter(s => s.status === 'completed').length;
    return (completedSteps / currentWorkflow.steps.length) * 100;
  };

  // Loading State (nur initial)
  if (isLoading && !currentWorkflow) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error State (ohne Workflow)
  if (error && !currentWorkflow) {
    return (
      <Box maxWidth="lg" mx="auto" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/workflows')}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }
 

  if (!currentWorkflow || currentWorkflow.workflow_id != id) {
    // Falls die ID aus der URL nicht mit dem geladenen Workflow übereinstimmt, 
    // bedeutet dies, dass wir entweder noch auf den Fetch warten oder er fehlgeschlagen ist.
    // Wir zeigen den Ladezustand erneut, wenn isLoading true ist, oder eine Warnung.
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
      <Box maxWidth="lg" mx="auto" p={3}>
        <Alert severity="warning">
          Workflow mit ID "{id}" konnte nicht geladen werden.
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/workflows')}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box maxWidth="lg" mx="auto" p={3}>
          {/* Header Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider',
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #2D3748 0%, #1A202C 100%)' 
                : 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFC 100%)'
            }}
          >
            {/* Top Row: Navigation & Actions */}
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between" 
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton 
                  onClick={() => navigate('/workflows')}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Workflow #{currentWorkflow.workflow_id}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={getStatusLabel(currentWorkflow.status)} 
                      color={getStatusColor(currentWorkflow.status)} 
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    {isPolling && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CircularProgress size={12} />
                        <Typography variant="caption" color="text.secondary">
                          Live-Updates
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
              
              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <IconButton 
                  onClick={handleRefresh} 
                  title="Aktualisieren"
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Refresh />
                </IconButton>
                
                {currentWorkflow.status === 'draft' && (
                  <Button 
                    variant="contained" 
                    startIcon={<PlayArrow />} 
                    onClick={handleApprove}
                    disabled={isLoading}
                  >
                    Genehmigen & Starten
                  </Button>
                )}
                
                {currentWorkflow.status === 'failed' && (
                  <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<Replay />} 
                    onClick={handleRestart}
                    disabled={isLoading}
                  >
                    Neu starten
                  </Button>
                )}
                
                <IconButton 
                  color="error" 
                  onClick={handleDelete}
                  disabled={isLoading}
                  title="Löschen"
                >
                  <Delete />
                </IconButton>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Workflow Info Grid */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
              {/* Left Column */}
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  ZIEL
                </Typography>
                <Typography variant="body1" fontWeight="medium" mb={2}>
                  {currentWorkflow.user_intent || 'Keine Beschreibung verfügbar'}
                </Typography>

                {currentWorkflow.created_at && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      ERSTELLT
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(currentWorkflow.created_at).toLocaleString('de-DE', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Right Column: Progress */}
              <Box>
                {currentWorkflow.steps && currentWorkflow.steps.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          FORTSCHRITT
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {currentWorkflow.steps.filter(s => s.status === 'completed').length} / {currentWorkflow.steps.length} Schritte
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgress()} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          bgcolor: 'action.hover'
                        }}
                      />
                      {currentWorkflow.status === 'completed' && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            Erfolgreich abgeschlossen
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}

                {lastUpdate && (
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Letzte Aktualisierung: {lastUpdate.toLocaleTimeString('de-DE')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
              {error}
            </Alert>
          )}

          {/* Timeline Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              border: '1px solid', 
              borderColor: 'divider' 
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Workflow Schritte
            </Typography>
            
            {/* WICHTIG: Die ID wird nun zusätzlich explizit übergeben */}
            <WorkflowTimeline 
              workflow={currentWorkflow} 
              workflowId={id} 
            /> 

          </Paper>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}