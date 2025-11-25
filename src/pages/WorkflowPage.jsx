// src/pages/WorkflowPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import {
  createWorkflow,
  listWorkflows,
  getWorkflowStatus,
  confirmWorkflowStep,
  getWorkflowCapabilities,
  cancelWorkflow,
  deleteWorkflow,
} from '../api/workflow';
import { getErrorMessage } from '../api/client';

// Import der neuen Komponenten
import WorkflowCard from '../components/WorkflowCard';
import WorkflowDetailsModal from '../components/WorkflowDetailsModal';

const WorkflowPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form States
  const [newWorkflowIntent, setNewWorkflowIntent] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Load workflows and capabilities
  useEffect(() => {
    loadWorkflows();
    loadCapabilities();
  }, [filterStatus]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows(filterStatus || null, 50);
      setWorkflows(data.workflows || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadCapabilities = async () => {
    try {
      const data = await getWorkflowCapabilities();
      setCapabilities(data);
    } catch (err) {
      console.error('Failed to load capabilities:', err);
    }
  };

  const MOCK_USER_ID = 'user-12345'; // <-- HIER DEFINIEREN

  const handleCreateWorkflow = async () => {
      if (!newWorkflowIntent.trim()) {
        setError('Bitte geben Sie einen Intent ein');
        return;
      }

      try {
        const sessionId = `wf-${Date.now()}`;
        
        // KORRIGIERTER AUFRUF: Übergabe des MOCK_USER_ID als dritter Parameter
        await createWorkflow(newWorkflowIntent, sessionId, MOCK_USER_ID); 
        
        setSuccess('Workflow erfolgreich erstellt!');
        setShowCreateModal(false);
        setNewWorkflowIntent('');
        loadWorkflows();
      } catch (err) {
        setError(getErrorMessage(err));
      }
  };

  const handleCancelWorkflow = async (workflowId) => {
    if (!window.confirm('Möchten Sie diesen Workflow wirklich abbrechen?'))
      return;

    try {
      await cancelWorkflow(workflowId);
      setSuccess('Workflow wurde abgebrochen');
      loadWorkflows();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!window.confirm('Möchten Sie diesen Workflow wirklich löschen?')) return;

    try {
      await deleteWorkflow(workflowId);
      setSuccess('Workflow wurde gelöscht');
      loadWorkflows();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleShowDetails = async (workflow) => {
    try {
      const details = await getWorkflowStatus(workflow.session_id);
      setSelectedWorkflow(details);
      setShowDetailModal(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleConfirmStep = async (workflowId, confirmed) => {
    try {
      await confirmWorkflowStep(workflowId, confirmed);
      setSuccess(confirmed ? 'Step bestätigt' : 'Step abgelehnt');
      // Update details modal and list
      if (selectedWorkflow) {
        const updated = await getWorkflowStatus(selectedWorkflow.session_id);
        setSelectedWorkflow(updated);
      }
      loadWorkflows();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Workflow Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Erstellen und verwalten Sie komplexe Multi-Step Workflows mit
          AI-Unterstützung
        </Typography>
      </Box>

      {/* Capabilities Card */}
      {capabilities && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🛠️ Verfügbare Tools ({capabilities.tools_count})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {capabilities.tools.map((tool, i) => (
                <Chip
                  key={i}
                  label={tool}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
        >
          Neuer Workflow
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filterStatus}
            label="Status Filter"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="running">Läuft</MenuItem>
            <MenuItem value="completed">Abgeschlossen</MenuItem>
            <MenuItem value="failed">Fehlgeschlagen</MenuItem>
            <MenuItem value="waiting_confirmation">
              Wartet auf Bestätigung
            </MenuItem>
            <MenuItem value="cancelled">Abgebrochen</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Workflows Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Lade Workflows...</Typography>
        </Box>
      ) : workflows.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h2" sx={{ mb: 2 }}>
              🔄
            </Typography>
            <Typography variant="h6" gutterBottom>
              Keine Workflows vorhanden
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Erstellen Sie Ihren ersten Workflow, um zu beginnen
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Neuer Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {workflows.map((workflow) => (
              <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                <WorkflowCard
                  workflow={workflow}
                  onShowDetails={handleShowDetails}
                  onCancel={handleCancelWorkflow}
                  onDelete={handleDeleteWorkflow}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Create Workflow Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Neuer Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Intent (Beschreiben Sie Ihre Aufgabe)"
            fullWidth
            multiline
            rows={4}
            value={newWorkflowIntent}
            onChange={(e) => setNewWorkflowIntent(e.target.value)}
            placeholder="z.B. 'Finde eine Wohnung in Berlin und vereinbare Besichtigungstermine'"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Abbrechen</Button>
          <Button
            onClick={handleCreateWorkflow}
            variant="contained"
            disabled={!newWorkflowIntent.trim()}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Details Modal */}
      <WorkflowDetailsModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        workflowDetails={selectedWorkflow}
        onConfirmStep={handleConfirmStep}
      />

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowPage;