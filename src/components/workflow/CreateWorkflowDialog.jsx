//src/components/workflow/CreateWorkflowDialog.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

export default function CreateWorkflowDialog({ open, onClose, onSubmit, isLoading }) {
  const [intent, setIntent] = useState('');

  const handleSubmit = () => {
    if (intent.trim()) {
      onSubmit(intent);
      setIntent('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" />
        Neuen Workflow starten
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Beschreiben Sie, was der Assistent für Sie tun soll. Zum Beispiel: 
          "Recherchiere die besten CRM-Tools und sende mir eine Zusammenfassung per E-Mail."
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="intent"
          label="Ihr Ziel (Intent)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={isLoading}
          placeholder="Was soll erledigt werden?"
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>Abbrechen</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!intent.trim() || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : null}
        >
          {isLoading ? 'Erstelle Plan...' : 'Plan erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}