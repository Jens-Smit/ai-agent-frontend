import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AccountCircle,
  Save,
  VpnKey,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api/services/authService';

function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const handleProfileSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const result = await updateProfile({ name: profileData.name });
      
      if (result.success) {
        setSuccess('Profil erfolgreich aktualisiert');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      setError('Fehler beim Speichern des Profils');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Die neuen Passwörter stimmen nicht überein');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordSuccess('Passwort erfolgreich geändert');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Fehler beim Ändern des Passworts');
      console.error(err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AccountCircle sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Profil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verwalten Sie Ihre Kontoinformationen
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profil Informationen */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{profileData.name || 'Benutzer'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                margin="normal"
              />

              <TextField
                fullWidth
                label="E-Mail"
                value={profileData.email}
                disabled
                margin="normal"
                helperText="E-Mail kann nicht geändert werden"
              />

              <Box mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  onClick={handleProfileSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Wird gespeichert...' : 'Profil speichern'}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Passwort ändern */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <VpnKey color="primary" />
                <Typography variant="h6">Passwort ändern</Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}
              
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Aktuelles Passwort"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Neues Passwort"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                margin="normal"
                helperText="Mindestens 8 Zeichen"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Neues Passwort bestätigen"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<VpnKey />}
                  onClick={handlePasswordChange}
                  disabled={
                    isChangingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {isChangingPassword ? 'Wird geändert...' : 'Passwort ändern'}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;