import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../api/auth';
import { getErrorMessage } from '../api/client';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', color: '#333' }}>
            Konto erstellen
          </h1>
          <p style={{ margin: 0, color: '#666' }}>Registriere dich für die AI Platform</p>
        </div>

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success">Registrierung erfolgreich! Weiterleitung...</Alert>}

        <form onSubmit={handleSubmit}>
          <Input 
            label="E-Mail" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            fullWidth 
            required 
          />
          <Input 
            label="Passwort" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            fullWidth 
            required 
          />
          <Input 
            label="Passwort bestätigen" 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            fullWidth 
            required 
          />

          <Button type="submit" fullWidth loading={loading} disabled={loading || success}>
            Registrieren
          </Button>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
            Bereits ein Account?{' '}
            <RouterLink 
              to="/login" 
              style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}
            >
              Jetzt anmelden
            </RouterLink>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;