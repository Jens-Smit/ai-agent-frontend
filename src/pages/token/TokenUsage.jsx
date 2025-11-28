import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ShowChart,
  TrendingUp,
  Refresh,
  Settings,
  Save,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { tokenService } from '../../api/services/tokenService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TokenUsage() {
  const [activeTab, setActiveTab] = useState(0);
  const [limits, setLimits] = useState(null);
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedLimits, setEditedLimits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [limitsData, usageData, historyData] = await Promise.all([
        tokenService.getLimits(),
        tokenService.getUsage('day'),
        tokenService.getUsageHistory(30),
      ]);
      
      setLimits(limitsData);
      setEditedLimits(limitsData.settings);
      setUsage(usageData.data);
      setHistory(historyData.data);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Daten');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLimits = async () => {
    try {
      await tokenService.updateLimits(editedLimits);
      setSuccess('Limits erfolgreich gespeichert');
      setEditMode(false);
      loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(err);
    }
  };

  const handleResetLimits = async () => {
    if (!window.confirm('Limits wirklich auf Standardwerte zurücksetzen?')) return;
    
    try {
      await tokenService.resetLimits();
      setSuccess('Limits auf Standardwerte zurückgesetzt');
      loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Fehler beim Zurücksetzen');
      console.error(err);
    }
  };

  const UsageCard = ({ title, limit, used, remaining, percent, enabled }) => (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {enabled ? (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h5" fontWeight={600}>
                {used?.toLocaleString() || 0}
              </Typography>
              <Chip
                label={`${percent?.toFixed(1) || 0}%`}
                size="small"
                color={percent > 80 ? 'error' : percent > 60 ? 'warning' : 'success'}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percent || 0, 100)}
              color={percent > 80 ? 'error' : percent > 60 ? 'warning' : 'success'}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Limit: {limit?.toLocaleString() || 0} • Verbleibend: {remaining?.toLocaleString() || 0}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nicht aktiviert
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <ShowChart sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Token Usage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Überwachen und verwalten Sie Ihre Token-Nutzung
            </Typography>
          </Box>
        </Box>
        
        <Button
          startIcon={<Refresh />}
          onClick={loadData}
          variant="outlined"
        >
          Aktualisieren
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Übersicht" />
          <Tab label="Limits" />
          <Tab label="Historie" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          {/* Aktuelle Nutzung */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <TrendingUp color="primary" />
              <Typography variant="h6">Heutige Nutzung</Typography>
            </Box>
            
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Gesamt Tokens
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {usage?.total_tokens?.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Input Tokens
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {usage?.total_input_tokens?.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Output Tokens
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {usage?.total_output_tokens?.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Aktuelle Limits
            </Typography>
            <Grid container spacing={2}>
              {limits?.current_usage && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <UsageCard
                      title="Minute"
                      {...limits.current_usage.minute}
                      enabled={limits.settings.minute_limit_enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <UsageCard
                      title="Stunde"
                      {...limits.current_usage.hour}
                      enabled={limits.settings.hour_limit_enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <UsageCard
                      title="Tag"
                      {...limits.current_usage.day}
                      enabled={limits.settings.day_limit_enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <UsageCard
                      title="Woche"
                      {...limits.current_usage.week}
                      enabled={limits.settings.week_limit_enabled}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <UsageCard
                      title="Monat"
                      {...limits.current_usage.month}
                      enabled={limits.settings.month_limit_enabled}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Nutzung nach Modell */}
          {usage?.by_model && usage.by_model.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nutzung nach Modell
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usage.by_model}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_tokens" fill="#4299E1" name="Tokens" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Settings color="primary" />
              <Typography variant="h6">Token Limits</Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              {editMode ? (
                <>
                  <Button startIcon={<Save />} onClick={handleSaveLimits} variant="contained">
                    Speichern
                  </Button>
                  <Button onClick={() => setEditMode(false)}>
                    Abbrechen
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setEditMode(true)} variant="outlined">
                    Bearbeiten
                  </Button>
                  <Button onClick={handleResetLimits} color="error">
                    Zurücksetzen
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {editedLimits && (
            <Grid container spacing={3}>
              {['minute', 'hour', 'day', 'week', 'month'].map((period) => (
                <Grid item xs={12} sm={6} key={period}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom textTransform="capitalize">
                        {period === 'minute' ? 'Minute' : period === 'hour' ? 'Stunde' : 
                         period === 'day' ? 'Tag' : period === 'week' ? 'Woche' : 'Monat'}
                      </Typography>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editedLimits[`${period}_limit_enabled`]}
                            onChange={(e) =>
                              setEditedLimits({
                                ...editedLimits,
                                [`${period}_limit_enabled`]: e.target.checked,
                              })
                            }
                            disabled={!editMode}
                          />
                        }
                        label="Aktiviert"
                      />
                      
                      <TextField
                        fullWidth
                        type="number"
                        label="Limit"
                        value={editedLimits[`${period}_limit`] || ''}
                        onChange={(e) =>
                          setEditedLimits({
                            ...editedLimits,
                            [`${period}_limit`]: parseInt(e.target.value) || null,
                          })
                        }
                        disabled={!editMode || !editedLimits[`${period}_limit_enabled`]}
                        margin="normal"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {activeTab === 2 && history && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            30-Tage Verlauf
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history.by_model || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_tokens" stroke="#4299E1" name="Tokens" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
}

export default TokenUsage;