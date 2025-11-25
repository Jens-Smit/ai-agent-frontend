// src/pages/AgentPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { callPersonalAssistant, callDevAgent, callFrontendDevAgent } from '../api/agent';
import { getErrorMessage } from '../api/client';

const AgentPage = ({ agentType = 'personal' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const { statuses, completed, result, error: statusError, stopPolling } = useAgentStatus(sessionId);

  const agentConfig = {
    personal: {
      title: 'Personal Assistant',
      icon: '🤖',
      color: 'primary',
      description: 'Ihr persönlicher KI-Assistent für alltägliche Aufgaben',
      apiCall: callPersonalAssistant,
    },
    dev: {
      title: 'Development Agent',
      icon: '💻',
      color: 'secondary',
      description: 'Generiert Symfony/PHP Code mit Tests',
      apiCall: callDevAgent,
    },
    frontend: {
      title: 'Frontend Generator',
      icon: '🎨',
      color: 'success',
      description: 'Erstellt React Frontend-Anwendungen',
      apiCall: callFrontendDevAgent,
    },
  };

  const config = agentConfig[agentType];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { text: input, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    setSessionId(null);

    try {
      const response = await config.apiCall(input);
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
        setMessages(prev => [
          ...prev,
          {
            text: response.message,
            isUser: false,
            sessionId: response.sessionId,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      setMessages(prev => [
        ...prev,
        {
          text: `Fehler: ${errMsg}`,
          isUser: false,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStopPolling = () => {
    stopPolling();
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setInput('');
  };

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 3, background: `${config.color}.main`, color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              {config.icon}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {config.title}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {config.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={completed ? '✅ Abgeschlossen' : sessionId ? '🔄 Läuft' : '⚪ Bereit'}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <IconButton
              onClick={handleReset}
              sx={{ color: 'white' }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Status Monitor */}
      {sessionId && statuses.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">📊 Status Monitor</Typography>
              {!completed && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<StopIcon />}
                  onClick={handleStopPolling}
                >
                  Stop Polling
                </Button>
              )}
            </Box>
            
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              <AnimatePresence>
                {statuses.map((status, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor: 'action.hover',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="body2" gutterBottom>
                        {status.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(status.timestamp).toLocaleTimeString('de-DE')}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>

            {completed && result && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Ergebnis:
                </Typography>
                <Typography variant="body2">{result}</Typography>
              </Alert>
            )}

            {statusError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {statusError}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card sx={{ mb: 2, minHeight: 500, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ fontSize: '4rem', mb: 2 }}>{config.icon}</Box>
              <Typography variant="h5" gutterBottom>
                Starten Sie eine Konversation
              </Typography>
              <Typography color="text.secondary">
                Stellen Sie eine Frage oder beschreiben Sie Ihre Aufgabe
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          gap: 2,
                          flexDirection: msg.isUser ? 'row-reverse' : 'row',
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: msg.isUser ? 'primary.main' : msg.isError ? 'error.main' : 'secondary.main',
                          }}
                        >
                          {msg.isUser ? '👤' : config.icon}
                        </Avatar>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: msg.isUser ? 'primary.main' : msg.isError ? 'error.light' : 'background.paper',
                            color: msg.isUser ? 'white' : 'text.primary',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                          >
                            {msg.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              opacity: 0.7,
                            }}
                          >
                            {msg.timestamp.toLocaleTimeString('de-DE')}
                          </Typography>
                          {msg.sessionId && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                opacity: 0.5,
                                fontSize: '0.7rem',
                              }}
                            >
                              Session: {msg.sessionId}
                            </Typography>
                          )}
                        </Paper>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {config.icon}
                  </Avatar>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Agent wird gestartet...
                    </Typography>
                    <LinearProgress sx={{ mt: 1 }} />
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Schreiben Sie eine Nachricht..."
              disabled={loading}
              variant="outlined"
            />
            <Button
              variant="contained"
              color={config.color}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              endIcon={<SendIcon />}
              sx={{ minWidth: 120 }}
            >
              Senden
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Enter zum Senden, Shift+Enter für neue Zeile
          </Typography>
        </CardContent>
      </Card>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgentPage;