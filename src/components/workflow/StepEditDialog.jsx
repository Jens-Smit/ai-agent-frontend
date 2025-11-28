// src/components/workflow/StepEditDialog.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
} from '@mui/material';
import { Edit, Close } from '@mui/icons-material';
import apiClient from '../../api/client';

const STEP_TYPES = {
  tool_call: 'Tool-Aufruf',
  analysis: 'Analyse',
  decision: 'Entscheidung',
  notification: 'Benachrichtigung',
};

function StepEditDialog({ open, step, onClose, onSave }) {
  const [formData, setFormData] = useState({
    description: '',
    tool_name: '',
    tool_parameters: {},
    requires_confirmation: false,
    expected_output_format: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (step) {
      setFormData({
        description: step.description || '',
        tool_name: step.tool_name || '',
        tool_parameters: step.tool_parameters || {},
        requires_confirmation: step.requires_confirmation || false,
        expected_output_format: step.expected_output_format || null,
      });
    }
  }, [step]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(`/api/workflow/step/${step.id}`, formData);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParametersChange = (value) => {
    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, tool_parameters: parsed });
    } catch (err) {
      // Invalid JSON - keep as is for user to fix
    }
  };

  if (!step) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Edit color="primary" />
          <Typography variant="h6">Schritt bearbeiten</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={2}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Beschreibung"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            helperText="Beschreiben Sie, was dieser Schritt tun soll"
          />

          {step.step_type === 'tool_call' && (
            <>
              <TextField
                fullWidth
                label="Tool Name"
                value={formData.tool_name}
                onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
                helperText="Name des Tools, das aufgerufen werden soll"
              />

              <TextField
                fullWidth
                label="Tool Parameter (JSON)"
                multiline
                rows={6}
                value={JSON.stringify(formData.tool_parameters, null, 2)}
                onChange={(e) => handleParametersChange(e.target.value)}
                helperText="Parameter als JSON-Objekt"
                error={
                  (() => {
                    try {
                      JSON.parse(JSON.stringify(formData.tool_parameters));
                      return false;
                    } catch {
                      return true;
                    }
                  })()
                }
                sx={{ fontFamily: 'monospace' }}
              />
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={formData.requires_confirmation}
                onChange={(e) => 
                  setFormData({ ...formData, requires_confirmation: e.target.checked })
                }
              />
            }
            label="Bestätigung erforderlich"
          />

          <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
            <strong>Hinweis:</strong> Änderungen können nur in Draft-Workflows vorgenommen werden.
            Bei laufenden Workflows müssen Sie eine neue Version erstellen.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Speichere...' : 'Speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StepEditDialog;