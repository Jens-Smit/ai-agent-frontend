import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { Send, Code, CheckCircle, Error, Lightbulb } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { agentService } from '../../api/services/agentService';

function FrontendGenerator() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [agentStatus, setAgentStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessages, setStatusMessages] = useState([]);

  useEffect(() => {
    if (sessionId && isProcessing) {
      agentService.pollAgentStatus(
        sessionId,
        handleStatusUpdate,
        2000
      );
    }
  }, [sessionId, isProcessing]);

  const handleStatusUpdate = (status) => {
    setAgentStatus(status);
    
    if (status.statuses && status.statuses.length > 0) {
      setStatusMessages((prev) => [
        ...prev,
        ...status.statuses.filter(
          (s) => !prev.find((p) => p.timestamp === s.timestamp)
        ),
      ]);
    }
    
    if (status.completed || status.error) {
      setIsProcessing(false);
    }
    
    if (status.error) {
      setError(status.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setError(null);
    setIsProcessing(true);
    setStatusMessages([]);
    
    try {
      const response = await agentService.startFrontendGenerator(prompt);
      
      if (response.status === 'queued') {
        setSessionId(response.sessionId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start generator');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setSessionId(null);
    setAgentStatus(null);
    setIsProcessing(false);
    setError(null);
    setStatusMessages([]);
  };

  const examplePrompts = [
    'Erstelle eine Kontaktformular-Komponente mit Validierung',
    'Generiere ein Dashboard mit Statistik-Karten',
    'Baue eine Produktkarten-Liste mit Filter-Funktionalität',
    'Erstelle eine interaktive Datenvisualisierung',
    'Generiere ein Benutzer-Profil mit Bearbeitungsmodus',
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Code sx={{ fontSize: 40, color: 'secondary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Frontend Generator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generiere React-Komponenten mit KI
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Beschreiben Sie die gewünschte Komponente"
            placeholder="z.B. Erstelle eine Kontaktformular-Komponente mit Name, E-Mail und Nachricht..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            sx={{ mb: 2 }}
          />
          
          <Box display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={20} /> : <Send />}
              disabled={isProcessing || !prompt.trim()}
              fullWidth
            >
              {isProcessing ? 'Wird generiert...' : 'Generierung starten'}
            </Button>
            
            {(isProcessing || agentStatus) && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={isProcessing}
              >
                Zurücksetzen
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AnimatePresence>
        {(isProcessing || statusMessages.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">
                  Generierungsstatus
                </Typography>
                {isProcessing && <CircularProgress size={24} />}
                {agentStatus?.completed && (
                  <Chip
                    label="Abgeschlossen"
                    color="success"
                    icon={<CheckCircle />}
                  />
                )}
                {agentStatus?.error && (
                  <Chip
                    label="Fehler"
                    color="error"
                    icon={<Error />}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List>
                {statusMessages.map((msg, index) => (
                  <motion.div
                    key={msg.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem>
                      <ListItemText
                        primary={msg.message}
                        secondary={new Date(msg.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>

              {agentStatus?.result && (
                <Card variant="outlined" sx={{ mt: 2, bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Generierter Code:
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 400,
                      }}
                    >
                      <code>{agentStatus.result}</code>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Lightbulb color="primary" />
              <Typography variant="h6" gutterBottom>
                Beispiel-Prompts
              </Typography>
            </Box>
            <List dense>
              {examplePrompts.map((example, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setPrompt(example)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText primary={`• ${example}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'secondary.light' }}>
            <Typography variant="h6" gutterBottom>
              🎨 Tipps für bessere Ergebnisse
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Seien Sie spezifisch bei der Beschreibung" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Nennen Sie gewünschte Features explizit" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Geben Sie Styling-Präferenzen an" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Erwähnen Sie notwendige Validierungen" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Beschreiben Sie das erwartete Verhalten" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FrontendGenerator;