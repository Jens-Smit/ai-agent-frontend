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
} from '@mui/material';
import { Send, SmartToy, CheckCircle, Error } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { agentService } from '../../api/services/agentService';
import { workflowService } from '../../api/services/workflowService';
import { v4 as uuidv4 } from 'uuid';

function PersonalAssistant() {
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
      
      // If workflow was created, navigate to it
      if (status.result) {
        try {
          const result = JSON.parse(status.result);
          if (result.workflow_id) {
            setTimeout(() => {
              navigate(`/workflows/${sessionId}`);
            }, 2000);
          }
        } catch (e) {
          console.error('Failed to parse result:', e);
        }
      }
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
    
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    try {
      const response = await agentService.startPersonalAssistant(prompt);
      
      if (response.status === 'queued') {
        setSessionId(response.sessionId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start agent');
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

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SmartToy sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Personal Assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ihr intelligenter AI-Assistent für komplexe Aufgaben
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Beschreiben Sie Ihre Aufgabe"
            placeholder="z.B. Sende eine E-Mail an max@example.com mit dem Betreff 'Meeting Einladung' und erstelle einen Termin für nächsten Montag um 14:00 Uhr..."
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
              {isProcessing ? 'Wird verarbeitet...' : 'Agent starten'}
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
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h6">
                  Verarbeitungsstatus
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
                      Ergebnis:
                    </Typography>
                    <Typography variant="body2">
                      {agentStatus.result}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          💡 Beispielaufgaben
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• Sende eine E-Mail an [Empfänger] mit [Betreff] und [Inhalt]" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Erstelle einen Kalendereintrag für [Datum] um [Uhrzeit]" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Suche nach [Information] und fasse die Ergebnisse zusammen" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Analysiere das Dokument [Name] und erstelle eine Zusammenfassung" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}

export default PersonalAssistant;