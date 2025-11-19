import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import Button from '../shared/Button';

// Import Pages
import DashboardPage from '../../pages/DashboardPage';
import AgentPage from '../../pages/AgentPage';
import ProfilePage from '../../pages/ProfilePage';
import WorkflowPage from '../../pages/WorkflowPage'; // ✅ NEU

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Personal Assistant', icon: '🤖', path: '/agent' },
    { label: 'Dev Agent', icon: '💻', path: '/dev-agent' },
    { label: 'Frontend Agent', icon: '🎨', path: '/frontend-agent' },
    { label: 'Workflows', icon: '🔄', path: '/workflows' }, // ✅ NEU
    { label: 'Profil', icon: '👤', path: '/profile' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '80px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        transition: 'width 0.3s',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {sidebarOpen && <h2 style={{ margin: 0, fontSize: '1.5rem' }}>AI Platform</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.95rem',
                transition: 'background 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <span style={{ fontSize: '1.5rem', minWidth: '24px' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '16px' 
            }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', opacity: 0.8 }}>
                Angemeldet als
              </p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all' }}>
                {user?.email}
              </p>
            </div>
            <Button variant="outlined" color="error" fullWidth onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '280px' : '80px',
        flex: 1,
        padding: '32px',
        transition: 'margin-left 0.3s',
        maxWidth: '100%',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agent" element={<AgentPage agentType="personal" />} />
          <Route path="/dev-agent" element={<AgentPage agentType="dev" />} />
          <Route path="/frontend-agent" element={<AgentPage agentType="frontend" />} />
          <Route path="/workflows" element={<WorkflowPage />} /> {/* ✅ NEU */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;