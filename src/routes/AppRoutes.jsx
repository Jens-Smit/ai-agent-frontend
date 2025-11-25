// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../components/Layout/MainLayout';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import GoogleCallbackPage from '../pages/GoogleCallbackPage';
import DashboardPage from '../pages/DashboardPage';
import WorkflowPage from '../pages/WorkflowPage';
import AgentPage from '../pages/AgentPage';
import DocumentsPage from '../pages/DocumentsPage';
import KnowledgePage from '../pages/KnowledgePage';
import ProfilePage from '../pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isAuthenticated) {
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
      
      {/* Google OAuth Callback */}
      <Route path="/connect/google/callback" element={<GoogleCallbackPage />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workflows" element={<WorkflowPage />} />
                <Route path="/agent/personal" element={<AgentPage agentType="personal" />} />
                <Route path="/agent/dev" element={<AgentPage agentType="dev" />} />
                <Route path="/agent/frontend" element={<AgentPage agentType="frontend" />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;