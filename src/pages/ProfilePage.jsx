import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout, changePassword } from '../api/auth';
import { getUserSettings, updateUserSettings } from '../api/user';
import { getErrorMessage } from '../api/client';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const ProfilePage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  // State für Email Settings
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);

  // State für Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Load Settings on Mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getUserSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setSettingsError(getErrorMessage(err));
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      setSettingsError(null);
      
      const response = await updateUserSettings(settings);
      setSettings(response.settings);
      setSettingsSuccess('Einstellungen erfolgreich gespeichert!');
      
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err) {
      setSettingsError(getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwörter stimmen nicht überein');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError(null);
      
      await changePassword(currentPassword, newPassword);
      
      setPasswordSuccess('Passwort erfolgreich geändert!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
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
      [field]: value
    }));
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '2rem', 
            color: 'white' 
          }}>
            👤
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px' }}>Mein Profil</h2>
            <p style={{ margin: 0, color: '#666' }}>{user?.email}</p>
          </div>
        </div>
      </Card>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Account Info */}
        <Card>
          <h3 style={{ margin: '0 0 16px' }}>Account-Informationen</h3>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#666' }}>E-Mail</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{user?.email}</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#666' }}>Rollen</p>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {user?.roles?.join(', ') || 'ROLE_USER'}
            </p>
          </div>
          {user?.googleId && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#666' }}>
                Verbunden mit
              </p>
              <p style={{ margin: 0, fontWeight: 500 }}>🔵 Google Account</p>
            </div>
          )}
        </Card>

        {/* Password Change */}
        {!user?.googleId && (
          <Card>
            <h3 style={{ margin: '0 0 16px' }}>Passwort ändern</h3>
            
            {passwordError && (
              <Alert severity="error" onClose={() => setPasswordError(null)}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" onClose={() => setPasswordSuccess(null)}>
                {passwordSuccess}
              </Alert>
            )}

            <form onSubmit={handleChangePassword}>
              <Input
                label="Aktuelles Passwort"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                fullWidth
                required
                disabled={changingPassword}
              />
              <Input
                label="Neues Passwort"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                disabled={changingPassword}
              />
              <Input
                label="Neues Passwort bestätigen"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
                disabled={changingPassword}
              />
              <Button 
                type="submit" 
                fullWidth 
                loading={changingPassword} 
                disabled={changingPassword}
              >
                Passwort ändern
              </Button>
            </form>
          </Card>
        )}

        {/* Email Settings */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 16px' }}>📧 E-Mail Einstellungen</h3>
          
          {settingsError && (
            <Alert severity="error" onClose={() => setSettingsError(null)}>
              {settingsError}
            </Alert>
          )}
          {settingsSuccess && (
            <Alert severity="success" onClose={() => setSettingsSuccess(null)}>
              {settingsSuccess}
            </Alert>
          )}

          {loadingSettings ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner />
              <p style={{ marginTop: '16px', color: '#666' }}>Lade Einstellungen...</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              <Input
                label="E-Mail Adresse"
                type="email"
                value={settings?.emailAddress || ''}
                onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                fullWidth
                disabled={savingSettings}
              />

              <h4 style={{ gridColumn: '1 / -1', margin: '16px 0 8px', fontSize: '1rem' }}>
                SMTP (Senden)
              </h4>
              <Input
                label="SMTP Host"
                value={settings?.smtp?.host || ''}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                fullWidth
                disabled={savingSettings}
                placeholder="smtp.gmail.com"
              />
              <Input
                label="SMTP Port"
                type="number"
                value={settings?.smtp?.port || 587}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                fullWidth
                disabled={savingSettings}
              />
              <Input
                label="SMTP Verschlüsselung"
                value={settings?.smtp?.encryption || 'tls'}
                onChange={(e) => handleSettingChange('smtpEncryption', e.target.value)}
                fullWidth
                disabled={savingSettings}
                placeholder="tls / ssl"
              />
              <Input
                label="SMTP Username"
                value={settings?.smtp?.username || ''}
                onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                fullWidth
                disabled={savingSettings}
              />
              <Input
                label="SMTP Passwort"
                type="password"
                value={settings?.smtp?.password || ''}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                fullWidth
                disabled={savingSettings}
              />

              <h4 style={{ gridColumn: '1 / -1', margin: '16px 0 8px', fontSize: '1rem' }}>
                IMAP (Empfangen)
              </h4>
              <Input
                label="IMAP Host"
                value={settings?.imap?.host || ''}
                onChange={(e) => handleSettingChange('imapHost', e.target.value)}
                fullWidth
                disabled={savingSettings}
                placeholder="imap.gmail.com"
              />
              <Input
                label="IMAP Port"
                type="number"
                value={settings?.imap?.port || 993}
                onChange={(e) => handleSettingChange('imapPort', parseInt(e.target.value))}
                fullWidth
                disabled={savingSettings}
              />
              <Input
                label="IMAP Verschlüsselung"
                value={settings?.imap?.encryption || 'ssl'}
                onChange={(e) => handleSettingChange('imapEncryption', e.target.value)}
                fullWidth
                disabled={savingSettings}
                placeholder="ssl / tls"
              />

              <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <Button 
                  fullWidth 
                  onClick={handleSaveSettings}
                  loading={savingSettings}
                  disabled={savingSettings}
                >
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Security Info & Logout */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px' }}>Sicherheit</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                JWT + httpOnly Cookies • Token Gültigkeit: 1 Stunde • Refresh: 7 Tage
              </p>
            </div>
            <Button color="error" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;