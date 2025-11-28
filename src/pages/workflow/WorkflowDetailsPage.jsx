import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Chip, 
  IconButton, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  Delete, 
  PlayArrow, 
  Replay 
} from '@mui/icons-material';
import { useWorkflowStore } from '../../store/workflowStore';
import WorkflowTimeline from '../../components/workflow/WorkflowTimeline';

export default function WorkflowDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { 
    currentWorkflow, 
    fetchWorkflow, 
    approveWorkflow, 
    restartWorkflow, 
    deleteWorkflow,
    isLoading,
    error 
  } = useWorkflowStore();

  const [polling, setPolling] = useState(false);
  const pollInterval = useRef(null);

  // Initial Load
  useEffect(() => {
    if (id) {
      fetchWorkflow(id).then(() => {
        // Starte Polling nur wenn Workflow läuft
        setPolling(true);
      }).catch(error => {
        console.error('Fehler beim Laden:', error);
      });
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [id]);

  // Polling Logic
  useEffect(() => {
    if (!polling || !id) {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      return;
    }

    // Polling nur wenn Workflow aktiv ist
    const shouldPoll = currentWorkflow && 
      ['running', 'waiting_user_input', 'waiting_confirmation'].includes(currentWorkflow.status);

    if (!shouldPoll) {
      setPolling(false);
      return;
    }

    pollInterval.current = setInterval(() => {
      fetchWorkflow(id).catch(err => {
        console.error('Polling Fehler:', err);
        setPolling(false);
      });
    }, 3000); // Alle 3 Sekunden

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [id, polling, currentWorkflow?.status]);

  // Handlers
  const handleApprove = async () => {
    try {
      await approveWorkflow(id);
      setPolling(true);
    } catch (error) {
      console.error('Fehler beim Starten:', error);
    }
  };

  const handleRestart = async () => {
    if (!window.confirm('Workflow ab dem Fehler neu starten?')) return;
    
    try {
      await restartWorkflow(id, { reset_failed_steps: true });
      setPolling(true);
    } catch (error) {
      console.error('Fehler beim Neustart:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Workflow wirklich löschen?')) return;
    
    try {
      await deleteWorkflow(id);
      navigate('/workflows');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const handleRefresh = () => {
    fetchWorkflow(id);
  };

  // Status Chip Farbe
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'running': return 'info';
      case 'waiting_user_input': return 'warning';
      case 'waiting_confirmation': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'running': return 'Läuft';
      case 'waiting_user_input': return 'Auth erforderlich';
      case 'waiting_confirmation': return 'Bestätigung';
      case 'completed': return 'Abgeschlossen';
      case 'failed': return 'Fehlgeschlagen';
      default: return status;
    }
  };

  // Loading State
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

  // Error State
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

  // Workflow nicht gefunden
  if (!currentWorkflow || currentWorkflow.id !== Number(id)) {
    return (
      <Box maxWidth="lg" mx="auto" p={3}>
        <Alert severity="warning">
          Workflow nicht gefunden oder noch nicht geladen.
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
    <Box maxWidth="lg" mx="auto" p={3}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/workflows')}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              Workflow #{currentWorkflow.id}
            </Typography>
            <Chip 
              label={getStatusLabel(currentWorkflow.status)} 
              color={getStatusColor(currentWorkflow.status)} 
              variant="outlined"
            />
            {polling && (
              <CircularProgress size={20} />
            )}
          </Box>
          
          <Box display="flex" gap={1}>
            <IconButton onClick={handleRefresh} title="Aktualisieren">
              <Refresh />
            </IconButton>
            
            {currentWorkflow.status === 'draft' && (
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />} 
                onClick={handleApprove}
                disabled={isLoading}
              >
                Starten
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
                Neustart
              </Button>
            )}
            
            <IconButton 
              color="error" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          <strong>Ziel:</strong> {currentWorkflow.user_intent || 'Keine Beschreibung'}
        </Typography>

        {currentWorkflow.steps && (
          <Box mt={1}>
            <Typography variant="body2" color="text.secondary">
              Fortschritt: Schritt {currentWorkflow.current_step} von {currentWorkflow.steps.length}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Timeline */}
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
        <WorkflowTimeline workflow={currentWorkflow} />
      </Paper>
    </Box>
  );
}