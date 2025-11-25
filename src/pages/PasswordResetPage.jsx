// src/pages/PasswordResetPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { requestPasswordReset, resetPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(token ? 1 : 0);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Bitte E-Mail-Adresse eingeben');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setStep(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setStep(2);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ maxWidth: 450, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4299E1 0%, #38B2AC 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  mb: 2,
                }}
              >
                🔒
              </Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Passwort zurücksetzen
              </Typography>
              <Typography color="text.secondary">
                {step === 0 && 'Geben Sie Ihre E-Mail-Adresse ein'}
                {step === 1 && !token && 'Prüfen Sie Ihr E-Mail-Postfach'}
                {step === 1 && token && 'Neues Passwort eingeben'}
                {step === 2 && 'Passwort erfolgreich zurückgesetzt'}
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && step === 1 && !token && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Reset-Link wurde gesendet! Prüfen Sie Ihr Postfach.
              </Alert>
            )}

            {success && step === 2 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Passwort erfolgreich zurückgesetzt! Weiterleitung zum Login...
              </Alert>
            )}

            {/* Request Reset Form */}
            {!token && !success && (
              <form onSubmit={handleRequestReset}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  disabled={loading}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
                </Button>

                <Typography variant="body2" align="center">
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                  >
                    Zurück zum Login
                  </Link>
                </Typography>
              </form>
            )}

            {/* Reset Password Form */}
            {token && !success && (
              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="Neues Passwort"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  required
                  helperText="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Passwort bestätigen"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
                </Button>
              </form>
            )}

            {/* Success State with Token */}
            {success && step === 1 && !token && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2">
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                  >
                    Zurück zum Login
                  </Link>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default PasswordResetPage;