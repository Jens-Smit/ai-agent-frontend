import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authService } from '../../api/services/authService';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Ungültiger oder fehlender Reset-Token');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Ungültiger Reset-Token');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)'
            : 'linear-gradient(135deg, #4299E1 0%, #2B6CB0 100%)',
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            maxWidth: 450,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
            Neues Passwort
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Geben Sie Ihr neues Passwort ein
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Passwort erfolgreich zurückgesetzt! Sie werden zum Login weitergeleitet...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Neues Passwort"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              margin="normal"
              required
              disabled={!token || success}
              helperText="Mindestens 8 Zeichen"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Passwort bestätigen"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              disabled={!token || success}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !token || success}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? 'Wird gespeichert...' : 'Passwort zurücksetzen'}
            </Button>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default ResetPassword;