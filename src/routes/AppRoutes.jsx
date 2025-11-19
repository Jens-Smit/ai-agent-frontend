import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/shared/Spinner';

// Layouts
import MainLayout from '../components/Layout/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import GoogleCallbackPage from '../pages/GoogleCallbackPage';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spinner size={60} />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[Route] Redirecting to login from:', location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spinner size={60} />
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('[Route] User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><PasswordResetPage /></PublicRoute>} />
      
      {/* Google OAuth Callback - Kein Auth-Check! */}
      <Route path="/connect/google/callback" element={<GoogleCallbackPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
      
      {/* Catch-all für unbekannte Routen */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;