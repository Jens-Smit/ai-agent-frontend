import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { checkAuth, loginUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('[Google Callback] Processing OAuth callback...');
        
        // Check for error in URL params
        const errorParam = searchParams.get('error');
        const hintParam = searchParams.get('hint');
        
        if (errorParam) {
          console.error('[Google Callback] OAuth error:', errorParam, hintParam);
          throw new Error(`Google Login fehlgeschlagen: ${errorParam}`);
        }

        // ⏳ Warte kurz, damit Backend Zeit hat, Cookies zu setzen
        await new Promise(resolve => setTimeout(resolve, 500));

        // 🔄 Auth-Status neu prüfen
        console.log('[Google Callback] Checking auth status...');
        await checkAuth();
        
        // ✅ User sollte jetzt authenticated sein
        console.log('[Google Callback] Auth check complete, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        
      } catch (err) {
        console.error('[Google Callback] Processing failed:', err);
        setError(err.message || 'Google Login fehlgeschlagen');
        setProcessing(false);
        
        // Redirect nach 3 Sekunden
        setTimeout(() => {
          navigate('/login?error=oauth_failed', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [navigate, checkAuth, searchParams]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f5' 
    }}>
      <Card style={{ textAlign: 'center', maxWidth: '400px', width: '90%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔵</div>
        {processing && !error && (
          <>
            <Spinner />
            <h2 style={{ marginTop: '24px', fontSize: '1.5rem' }}>
              Google Login wird verarbeitet...
            </h2>
            <p style={{ color: '#666', marginTop: '8px' }}>Bitte warten</p>
          </>
        )}
        {error && (
          <>
            <Alert severity="error">{error}</Alert>
            <p style={{ color: '#666', marginTop: '16px' }}>
              Du wirst in Kürze zum Login weitergeleitet...
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default GoogleCallbackPage;