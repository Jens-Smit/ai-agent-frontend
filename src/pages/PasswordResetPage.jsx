import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Card from '../components/shared/Card';
import Alert from '../components/shared/Alert';

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

  return (<div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f5f5' 
    }}>
      <Card style={{ maxWidth: '450px', width: '100%', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', color: '#333' }}>
            Passwort zurücksetzen
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            {step === 0 && 'Gib deine E-Mail-Adresse ein'}
            {step === 1 && 'Prüfe dein E-Mail-Postfach'}
            {step === 2 && 'Passwort erfolgreich zurückgesetzt'}
          </p>
        </div>    {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
    {success && step === 1 && (
      <Alert severity="success">Reset-Link wurde gesendet! Prüfe dein Postfach.</Alert>
    )}
    {success && step === 2 && (
      <Alert severity="success">Passwort erfolgreich zurückgesetzt! Weiterleitung...</Alert>
    )}    {/* Request Reset Form */}
    {!token && !success && (
      <form onSubmit={handleRequestReset}>
        <Input 
          label="E-Mail" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          fullWidth 
          required 
        />
        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          Reset-Link senden
        </Button>
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <RouterLink to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
            Zurück zum Login
          </RouterLink>
        </p>
      </form>
    )}    {/* Reset Password Form */}
    {token && !success && (
      <form onSubmit={handleResetPassword}>
        <Input 
          label="Neues Passwort" 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
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
        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          Passwort zurücksetzen
        </Button>
      </form>
    )}
  </Card>
</div>
);
};export default PasswordResetPage;