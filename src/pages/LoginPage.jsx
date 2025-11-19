import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, getGoogleOAuthUrl } from '../api/auth';
import { getErrorMessage } from '../api/client';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ❌ Verhindere mehrfache Redirects
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] User already authenticated, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check für OAuth Fehler in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'oauth_failed') {
      setError('Google Login fehlgeschlagen. Bitte versuche es erneut.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Bitte E-Mail und Passwort eingeben');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Login] Attempting login for:', email);
      const response = await login(email, password);
      
      console.log('[Login] Login successful:', response);
      loginUser(response.user);
      
      // Navigate nach kurzer Verzögerung
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      console.error('[Login] Login failed:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('[Login] Redirecting to Google OAuth...');
    window.location.href = getGoogleOAuthUrl();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f5' 
    }}>
      <Card style={{ maxWidth: '450px', width: '100%', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', color: '#333' }}>
            Willkommen zurück
          </h1>
          <p style={{ margin: 0, color: '#666' }}>Melde dich an, um fortzufahren</p>
        </div>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            disabled={loading}
            autoComplete="email"
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            disabled={loading}
            autoComplete="current-password"
          />

          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <RouterLink 
              to="/reset-password" 
              style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Passwort vergessen?
            </RouterLink>
          </div>

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Anmelden
          </Button>

          <div style={{ margin: '24px 0', textAlign: 'center', color: '#999' }}>oder</div>

          <Button 
            variant="outlined" 
            color="primary" 
            fullWidth 
            onClick={handleGoogleLogin} 
            disabled={loading}
            type="button"
          >
            <span style={{ fontSize: '1.2rem' }}>🔵</span> Mit Google anmelden
          </Button>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
            Noch kein Account?{' '}
            <RouterLink 
              to="/register" 
              style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
            >
              Jetzt registrieren
            </RouterLink>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
