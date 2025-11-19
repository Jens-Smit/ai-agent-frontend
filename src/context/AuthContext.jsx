import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

// Hilfsfunktion: Extrahiert Parameter aus dem URL-Hash (z.B. #access_token=...)
const parseHashParams = (hash) => {
  const params = {};
  if (!hash) return params;
  
  const hashString = hash.substring(1); // Entfernt das führende #
  
  hashString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Der Pfad, auf den Google zurückleitet
  const OAUTH_CALLBACK_PATH = '/oauth-callback';

  const checkAuth = useCallback(async () => {
    // 1. Öffentliche Pfade ignorieren (Performance)
    const publicPaths = ['/login', '/register', '/reset-password'];
    const currentPath = window.location.pathname;
    
    if (publicPaths.some(path => currentPath.includes(path))) {
      console.log('[Auth] Skipping auth check on public page');
      setLoading(false);
      return Promise.resolve(null); 
    }

    // 2. WICHTIG: Wenn kein Token im Storage ist, gar nicht erst versuchen!
    // Das verhindert den 401 Fehler in Ihren Logs.
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('[Auth] No token found in storage, skipping API call.');
      setLoading(false);
      return Promise.resolve(null);
    }

    try {
      setLoading(true);
      console.log('[Auth] Checking authentication with token...');
      
      // Der HTTP-Client (axios) muss sich den Token selbst aus localStorage holen
      const data = await getCurrentUser(); 
      
      if (data.user || data.email) {
        console.log('[Auth] User authenticated:', data.user?.email || data.email);
        const userData = data.user || data;
        setUser(userData);
        setError(null);
        return Promise.resolve(userData); 
      } else {
        setUser(null);
        return Promise.resolve(null);
      }
    } catch (err) {
      console.warn('[Auth] Check failed:', err.message);
      
      // Wenn der Check fehlschlägt (z.B. 401 trotz Token), aufräumen
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      setUser(null);
      setError(null);
      return Promise.reject(err); 
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOAuthRedirect = useCallback(async () => {
    const currentPath = window.location.pathname;
    const hash = window.location.hash;

    // Prüfen, ob wir auf der Callback-Seite sind UND Tokens im Hash haben
    if (currentPath.includes(OAUTH_CALLBACK_PATH) && hash) {
      console.log('[OAuth] Handling redirect callback...');
      const params = parseHashParams(hash);

      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;

      if (accessToken && refreshToken) {
        console.log('[OAuth] Tokens found. Storing immediately...');
        
        // 1. Tokens speichern (Kritischster Schritt)
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // 2. URL bereinigen (für die Optik, damit Token nicht in History bleibt)
        window.history.replaceState(null, '', OAUTH_CALLBACK_PATH);
        
        // 3. SOFORT Weiterleiten
        // Wir führen hier KEIN checkAuth() aus. Das vermeidet Race Conditions.
        // Die neue Seite (/dashboard) lädt frisch und führt dann checkAuth() mit den gespeicherten Tokens aus.
        console.log('[OAuth] Redirecting to dashboard...');
        window.location.replace('/dashboard');
        
        return true; // Signalisiert, dass der Redirect behandelt wurde
      }
    }
    return false;
  }, []);

  useEffect(() => {
    // Logik beim Mounten:
    // Erst schauen, ob wir gerade von Google kommen (Redirect).
    // Wenn ja -> Tokens speichern & Wegleiten.
    // Wenn nein -> Normaler Auth-Check.
    handleOAuthRedirect().then(isHandled => {
      if (!isHandled) {
        checkAuth();
      }
    });
  }, [checkAuth, handleOAuthRedirect]);

  const loginUser = useCallback((userData) => {
    console.log('[Auth] User logged in manually');
    setUser(userData);
    setError(null);
  }, []);

  const logoutUser = useCallback(() => {
    console.log('[Auth] User logged out');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setError(null);
    // Optional: Zur Login-Seite leiten
    // window.location.href = '/login';
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    loginUser,
    logoutUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};