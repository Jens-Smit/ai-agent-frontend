import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
} from '@mui/material';
import { Settings as SettingsIcon, Save, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { userSettingsService } from '../../api/services/tokenService';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await userSettingsService.getSettings();
      setSettings(response);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Einstellungen');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userSettingsService.updateSettings({
        emailAddress: settings.emailAddress,
        pop3Host: settings.pop3?.host,
        pop3Port: settings.pop3?.port,
        pop3Encryption: settings.pop3?.encryption,
        imapHost: settings.imap?.host,
        imapPort: settings.imap?.port,
        imapEncryption: settings.imap?.encryption,
        smtpHost: settings.smtp?.host,
        smtpPort: settings.smtp?.port,
        smtpEncryption: settings.smtp?.encryption,
        smtpUsername: settings.smtp?.username,
        smtpPassword: settings.smtp?.password,
      });
      
      setSuccess('Einstellungen erfolgreich gespeichert');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const encryptionOptions = [
    { value: 'none', label: 'Keine' },
    { value: 'ssl', label: 'SSL' },
    { value: 'tls', label: 'TLS' },
    { value: 'starttls', label: 'STARTTLS' },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Einstellungen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Konfigurieren Sie Ihre E-Mail-Einstellungen
          </Typography>
        </Box>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* E-Mail Adresse */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Email color="primary" />
            <Typography variant="h6">E-Mail Adresse</Typography>
          </Box>
          
          <TextField
            fullWidth
            label="E-Mail Adresse"
            type="email"
            value={settings?.emailAddress || ''}
            onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
          />
        </Paper>

        {/* POP3 Einstellungen */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            POP3 Einstellungen
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="POP3 Host"
                value={settings?.pop3?.host || ''}
                onChange={(e) => handleChange('pop3', 'host', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={settings?.pop3?.port || ''}
                onChange={(e) => handleChange('pop3', 'port', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Verschlüsselung"
                value={settings?.pop3?.encryption || 'none'}
                onChange={(e) => handleChange('pop3', 'encryption', e.target.value)}
              >
                {encryptionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* IMAP Einstellungen */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            IMAP Einstellungen
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IMAP Host"
                value={settings?.imap?.host || ''}
                onChange={(e) => handleChange('imap', 'host', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={settings?.imap?.port || ''}
                onChange={(e) => handleChange('imap', 'port', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Verschlüsselung"
                value={settings?.imap?.encryption || 'none'}
                onChange={(e) => handleChange('imap', 'encryption', e.target.value)}
              >
                {encryptionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* SMTP Einstellungen */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            SMTP Einstellungen
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={settings?.smtp?.host || ''}
                onChange={(e) => handleChange('smtp', 'host', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={settings?.smtp?.port || ''}
                onChange={(e) => handleChange('smtp', 'port', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Verschlüsselung"
                value={settings?.smtp?.encryption || 'none'}
                onChange={(e) => handleChange('smtp', 'encryption', e.target.value)}
              >
                {encryptionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Benutzername"
                value={settings?.smtp?.username || ''}
                onChange={(e) => handleChange('smtp', 'username', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Passwort"
                type="password"
                value={settings?.smtp?.password || ''}
                onChange={(e) => handleChange('smtp', 'password', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}

export default Settings;