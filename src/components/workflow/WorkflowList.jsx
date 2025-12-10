/**
 * WorkflowList.jsx - WORKFLOW ÜBERSICHT - VOLLSTÄNDIG ÜBERARBEITET
 * 
 * FEATURES:
 * - Grid-Layout mit Cards
 * - Filter nach Status
 * - Suche
 * - Quick Actions
 * - Animationen
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Stack
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  DeleteOutline,
  PlayArrow,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  AllInclusive,
  Edit,
  Replay
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import  {useWorkflowStore}  from '../../store/workflowStore';
import CreateWorkflowDialog from './CreateWorkflowDialog';

export default function WorkflowList() {
  const navigate = useNavigate();
  
  const { 
    workflows, 
    fetchWorkflows, 
    deleteWorkflow, 
    createWorkflow, 
    approveWorkflow,
    restartWorkflow,
    isLoading, 
    error 
  } = useWorkflowStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  // Initial Load
  useEffect(() => {
    console.log("WorkflowList: Initial Load");
    fetchWorkflows();
  }, [fetchWorkflows]);

  /**
   * Handler: Workflow erstellen
   */
  const handleCreate = async (intent) => {
    setIsCreating(true);
    try {
      const result = await createWorkflow(intent, null);
      setCreateOpen(false);
      console.log('Erstellter Workflow:', result);
      if (result && result.workflow_id) {
        navigate(`/workflows/${result.workflow_id}`);
      }
    } catch (err) {
      console.error('Fehler beim Erstellen:', err);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handler: Workflow löschen
   */
  const handleDelete = async (workflowId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('Workflow wirklich löschen?')) return;
    
    setDeletingId(workflowId);
    try {
      await deleteWorkflow(workflowId);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handler: Workflow genehmigen
   */
  const handleApprove = async (workflowId, event) => {
    event.stopPropagation();
    
    try {
      await approveWorkflow(workflowId);
      navigate(`/workflows/${workflowId}`);
    } catch (err) {
      console.error('Fehler beim Genehmigen:', err);
    }
  };

  /**
   * Handler: Workflow neu starten
   */
  const handleRestart = async (workflowId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('Workflow neu starten?')) return;
    
    try {
      await restartWorkflow(workflowId, { reset_failed_steps: true });
      navigate(`/workflows/${workflowId}`);
    } catch (err) {
      console.error('Fehler beim Neustart:', err);
    }
  };

  /**
   * Helper: Status Farbe
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      case 'draft': return 'default';
      case 'waiting_confirmation': return 'warning';
      case 'waiting_user_input': return 'secondary';
      default: return 'default';
    }
  };

  /**
   * Helper: Status Label
   */
  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'waiting_user_input': return 'Auth erforderlich';
      case 'waiting_confirmation': return 'Bestätigung';
      case 'running': return 'Läuft';
      case 'completed': return 'Fertig';
      case 'failed': return 'Fehler';
      default: return status;
    }
  };

  /**
   * Helper: Status Icon
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'failed': return <ErrorOutline fontSize="small" />;
      case 'running': return <CircularProgress size={16} />;
      case 'waiting_confirmation': 
      case 'waiting_user_input': 
        return <AccessTime fontSize="small" />;
      default: return <Edit fontSize="small" />;
    }
  };

  // Filtering & Search
  const safeWorkflows = Array.isArray(workflows) ? workflows : [];
  
  const filteredWorkflows = safeWorkflows
    .filter(w => {
      // Status Filter
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      
      // Search Filter
      if (searchTerm && !w?.user_intent?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Neueste zuerst

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Workflows
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verwalten und überwachen Sie Ihre KI-Automatisierungen
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Neuer Workflow
        </Button>
      </Box>

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Workflows durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
            sx={{ maxWidth: { md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="all">
              <AllInclusive sx={{ mr: 0.5 }} fontSize="small" />
              Alle
            </ToggleButton>
            <ToggleButton value="draft">Entwürfe</ToggleButton>
            <ToggleButton value="running">Läuft</ToggleButton>
            <ToggleButton value="waiting_confirmation">Bestätigung</ToggleButton>
            <ToggleButton value="completed">Fertig</ToggleButton>
            <ToggleButton value="failed">Fehler</ToggleButton>
          </ToggleButtonGroup>

          <Button 
            startIcon={<Refresh />} 
            onClick={() => fetchWorkflows()}
            disabled={isLoading}
            sx={{ ml: 'auto' }}
          >
            Aktualisieren
          </Button>
        </Stack>
      </Paper>

      {/* Fehler Anzeige */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === 'object' ? JSON.stringify(error) : error}
        </Alert>
      )}

      {/* Statistics */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            GESAMT
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {safeWorkflows.length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            AKTIV
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="info.main">
            {safeWorkflows.filter(w => w.status === 'running').length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            BENÖTIGEN AKTION
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="warning.main">
            {safeWorkflows.filter(w => 
              ['waiting_confirmation', 'waiting_user_input', 'draft'].includes(w.status)
            ).length}
          </Typography>
        </Paper>
      </Box>

      {/* Loading State */}
      {isLoading && safeWorkflows.length === 0 ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={60} />
        </Box>
      ) : filteredWorkflows.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Workflows gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Versuchen Sie, die Filter anzupassen' 
              : 'Erstellen Sie Ihren ersten Workflow'}
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setCreateOpen(true)}
            >
              Workflow erstellen
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence mode="popLayout">
            {filteredWorkflows.map((workflow, index) => (
              <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
                      border: '1px solid',
                      borderColor: workflow.status === 'running' ? 'info.main' : 
                                   workflow.status === 'failed' ? 'error.main' :
                                   workflow.status === 'waiting_confirmation' || 
                                   workflow.status === 'waiting_user_input' ? 'warning.main' :
                                   'divider',
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/workflows/${workflow.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Status & Date */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip 
                          label={getStatusLabel(workflow.status)} 
                          color={getStatusColor(workflow.status)} 
                          size="small" 
                          icon={getStatusIcon(workflow.status)}
                          variant={workflow.status === 'running' ? 'filled' : 'outlined'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {workflow.created_at ? 
                            new Date(workflow.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short'
                            }) : '-'}
                        </Typography>
                      </Box>
                      
                      {/* Title */}
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 64
                        }}
                      >
                        {workflow.user_intent || 'Unbenannter Workflow'}
                      </Typography>

                      {/* Workflow ID */}
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Workflow #{workflow.id}
                      </Typography>

                      {/* Progress Bar */}
                      {workflow.total_steps > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Fortschritt
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {workflow.current_step ?? 0} / {workflow.total_steps}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={((workflow.current_step ?? 0) / workflow.total_steps) * 100} 
                            sx={{ 
                              borderRadius: 1, 
                              height: 6,
                              bgcolor: 'action.hover'
                            }}
                            color={workflow.status === 'failed' ? 'error' : 'primary'}
                          />
                        </Box>
                      )}
                    </CardContent>
                    
                    {/* Actions */}
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                      <Box display="flex" gap={0.5}>
                        {/* Draft: Approve Button */}
                        {workflow.status === 'draft' && (
                          <Tooltip title="Genehmigen & Starten">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => handleApprove(workflow.id, e)}
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Failed: Restart Button */}
                        {workflow.status === 'failed' && (
                          <Tooltip title="Neu starten">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={(e) => handleRestart(workflow.id, e)}
                            >
                              <Replay fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Delete Button */}
                        <Tooltip title="Löschen">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => handleDelete(workflow.id, e)}
                            disabled={deletingId === workflow.id}
                          >
                            {deletingId === workflow.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteOutline fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Button 
                        size="small" 
                        endIcon={<PlayArrow />}
                        onClick={() => navigate(`/workflows/${workflow.id}`)}
                      >
                        Details
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Create Dialog */}
      <CreateWorkflowDialog 
        open={isCreateOpen} 
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </Box>
  );
}