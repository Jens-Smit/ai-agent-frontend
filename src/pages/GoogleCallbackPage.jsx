// src/pages/GoogleCallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('[Google Callback] Starte Cookie-Prüfung...');

        // Check for error in URL params
        const errorParam = searchParams.get('error');
        if (errorParam) {
          throw new Error('Google Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }

        // Cookies sind im Backend gesetzt, prüfe Auth-Status
        const userData = await checkAuth();

        if (userData) {
          console.log('✅ Auth check erfolgreich, Cookie wurde akzeptiert.');
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Login fehlgeschlagen. Backend lieferte keine Userdaten.');
        }
      } catch (err) {
        console.error('[Google Callback] Processing failed:', err);
        setError(err.message || 'Google Login fehlgeschlagen');
        setProcessing(false);
        
        // Redirect nach 5 Sekunden
        setTimeout(() => navigate('/login'), 5000);
      }
    };

    processCallback();
  }, [navigate, checkAuth, searchParams]);

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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4299E1 0%, #38B2AC 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                mb: 3,
              }}
            >
              🔵
            </Box>

            {processing && !error && (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Google Login wird verarbeitet...
                </Typography>
                <Typography color="text.secondary">
                  Bitte warten Sie, während wir Ihre Anmeldung bestätigen.
                </Typography>
              </>
            )}

            {error && (
              <>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Weiterleitung zum Login in 5 Sekunden...
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Sofort zum Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default GoogleCallbackPage;