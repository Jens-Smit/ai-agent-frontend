import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useLocation ist auch nützlich, aber window geht auch
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('[Google Callback] Starte Cookie-Prüfung...');

        // 1. Tokens sind nun im Browser-Speicher (HttpOnly Cookie), nicht in der URL.
        // Wir müssen nur checkAuth() aufrufen, um das Backend zu fragen: Bin ich eingeloggt?
        const userData = await checkAuth(); 

        if (userData) {
          console.log('✅ Auth check erfolgreich, Cookie wurde akzeptiert.');
          navigate('/dashboard', { replace: true });
        } else {
          // Dies passiert, wenn checkAuth() fehlschlägt, obwohl Tokens gesendet wurden
          throw new Error('Login fehlgeschlagen. Backend lieferte keine Userdaten.');
        }
      } catch (err) {
        console.error('[Google Callback] Processing failed:', err);
        setError(err.message || 'Google Login fehlgeschlagen');
        setProcessing(false);
       
      }
    };
    processCallback();
  }, [navigate, checkAuth]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f5' 
    }}>
      <Card style={{ textAlign: 'center', maxWidth: '600px', width: '90%', padding: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔵</div>
        
        {processing && !error && (
          <>
            <Spinner />
            <h2 style={{ marginTop: '24px', fontSize: '1.5rem' }}>
              Google Login wird verarbeitet...
            </h2>
            <p style={{ color: '#666', marginTop: '8px' }}>
                Tokens werden geprüft. Bitte öffne die Konsole (F12) für Details.
            </p>
          </>
        )}

        {error && (
          <>
            <Alert severity="error" title="Fehler aufgetreten">
                {error}
            </Alert>
            <p style={{ color: '#666', marginTop: '16px' }}>
              Weiterleitung zum Login in 5 Sekunden...
            </p>
            <button 
                onClick={() => navigate('/login')}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    background: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Sofort zum Login
            </button>
          </>
        )}
      </Card>
    </div>
  );
};

export default GoogleCallbackPage;