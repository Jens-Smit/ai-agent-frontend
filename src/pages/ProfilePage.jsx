// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { changePassword, logout } from '../api/auth';
import { updateUserProfile, getUserSettings, updateUserSettings } from '../api/user';
import { getErrorMessage } from '../api/client';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile State
  const [name, setName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Email Settings State
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getUserSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setUpdatingProfile(true);
      await updateUserProfile({ name });
      setSuccess('Profil aktualisiert!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      setSuccess('Passwort erfolgreich geändert!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    try {
      setSavingSettings(true);
      await updateUserSettings(settings);
      setSuccess('E-Mail-Einstellungen gespeichert!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    logoutUser();
    navigate('/login');
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Mein Profil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verwalten Sie Ihre Account-Einstellungen
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 16px',
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user?.name || user?.email}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {user?.roles?.map((role, i) => (
                    <Typography key={i} variant="caption" color="text.secondary">
                      {role}
                    </Typography>
                  ))}
                </Box>
                {user?.googleId && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Mit Google verbunden
                  </Alert>
                )}
                <Divider sx={{ my: 3 }} />
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                >
                  Abmelden
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Profile & Password Forms */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Update Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6">Profil aktualisieren</Typography>
                  </Box>
                  <form onSubmit={handleUpdateProfile}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      margin="normal"
                      disabled={updatingProfile}
                    />
                    <TextField
                      fullWidth
                      label="E-Mail"
                      value={user?.email || ''}
                      margin="normal"
                      disabled
                      helperText="E-Mail kann nicht geändert werden"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ mt: 2 }}
                      disabled={updatingProfile}
                    >
                      {updatingProfile ? 'Wird gespeichert...' : 'Profil speichern'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password (nur für nicht-Google User) */}
            {!user?.googleId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <LockIcon color="primary" />
                      <Typography variant="h6">Passwort ändern</Typography>
                    </Box>
                    <form onSubmit={handleChangePassword}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Aktuelles Passwort"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        margin="normal"
                        required
                        disabled={changingPassword}
                        autoComplete="current-password"
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Neues Passwort"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        margin="normal"
                        required
                        helperText="Mindestens 8 Zeichen"
                        disabled={changingPassword}
                        autoComplete="new-password"
                      />
                      <TextField
                        fullWidth
                        type="password"
                        label="Neues Passwort bestätigen"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        margin="normal"
                        required
                        disabled={changingPassword}
                        autoComplete="new-password"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ mt: 2 }}
                        disabled={changingPassword}
                      >
                        {changingPassword ? 'Wird geändert...' : 'Passwort ändern'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Email Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <EmailIcon color="primary" />
                    <Typography variant="h6">E-Mail Einstellungen</Typography>
                  </Box>
                  
                  {loadingSettings ? (
                    <Typography color="text.secondary">Lädt Einstellungen...</Typography>
                  ) : (
                    <form onSubmit={handleSaveSettings}>
                      <TextField
                        fullWidth
                        label="E-Mail Adresse"
                        value={settings?.emailAddress || ''}
                        onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                        margin="normal"
                        disabled={savingSettings}
                      />

                      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                        SMTP (Senden)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="SMTP Host"
                            value={settings?.smtp?.host || ''}
                            onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                            placeholder="smtp.gmail.com"
                            disabled={savingSettings}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Port"
                            value={settings?.smtp?.port || 587}
                            onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                            disabled={savingSettings}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth disabled={savingSettings}>
                            <InputLabel>Verschlüsselung</InputLabel>
                            <Select
                              value={settings?.smtp?.encryption || 'tls'}
                              label="Verschlüsselung"
                              onChange={(e) => handleSettingChange('smtpEncryption', e.target.value)}
                            >
                              <MenuItem value="tls">TLS</MenuItem>
                              <MenuItem value="ssl">SSL</MenuItem>
                              <MenuItem value="none">Keine</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="SMTP Username"
                            value={settings?.smtp?.username || ''}
                            onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                            disabled={savingSettings}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            type="password"
                            label="SMTP Passwort"
                            value={settings?.smtp?.password || ''}
                            onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                            disabled={savingSettings}
                          />
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                        IMAP (Empfangen)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="IMAP Host"
                            value={settings?.imap?.host || ''}
                            onChange={(e) => handleSettingChange('imapHost', e.target.value)}
                            placeholder="imap.gmail.com"
                            disabled={savingSettings}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Port"
                            value={settings?.imap?.port || 993}
                            onChange={(e) => handleSettingChange('imapPort', parseInt(e.target.value))}
                            disabled={savingSettings}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth disabled={savingSettings}>
                            <InputLabel>Verschlüsselung</InputLabel>
                            <Select
                              value={settings?.imap?.encryption || 'ssl'}
                              label="Verschlüsselung"
                              onChange={(e) => handleSettingChange('imapEncryption', e.target.value)}
                            >
                              <MenuItem value="ssl">SSL</MenuItem>
                              <MenuItem value="tls">TLS</MenuItem>
                              <MenuItem value="none">Keine</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Button
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={savingSettings}
                      >
                        {savingSettings ? 'Wird gespeichert...' : 'Einstellungen speichern'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Info */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6">Sicherheit</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  JWT + httpOnly Cookies • Token Gültigkeit: 1 Stunde • Refresh: 7 Tage
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;