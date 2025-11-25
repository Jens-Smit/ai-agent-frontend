// src/components/Layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountTree as WorkflowIcon,
  SmartToy as AgentIcon,
  Description as DocumentsIcon,
  Psychology as KnowledgeIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { id: 'workflows', label: 'Workflows', icon: WorkflowIcon, path: '/workflows' },
    {
      id: 'agents',
      label: 'Agenten',
      icon: AgentIcon,
      submenu: [
        { label: 'Personal Assistant', path: '/agent/personal' },
        { label: 'Dev Agent', path: '/agent/dev' },
        { label: 'Frontend Generator', path: '/agent/frontend' },
      ],
    },
    { id: 'documents', label: 'Dokumente', icon: DocumentsIcon, path: '/documents' },
    { id: 'knowledge', label: 'Wissensdatenbank', icon: KnowledgeIcon, path: '/knowledge' },
    { id: 'profile', label: 'Profil', icon: ProfileIcon, path: '/profile' },
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const sidebarWidth = open ? 260 : 80;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          bgcolor: theme.palette.mode === 'dark' ? '#2C5282' : '#1A365D',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4299E1 0%, #38B2AC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
          }}
        >
          🤖
        </Box>
        {open && (
          <Typography variant="h6" fontWeight={600}>
            AI Platform
          </Typography>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => item.path && navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {open && item.submenu && (
              <List sx={{ pl: 2 }}>
                {item.submenu.map((subItem, idx) => (
                  <ListItem key={idx} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate(subItem.path)}
                      selected={location.pathname === subItem.path}
                      sx={{
                        borderRadius: 2,
                        color: 'white',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255,255,255,0.15)',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={subItem.label}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* User Info & Logout */}
      {open && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Angemeldet als
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Abmelden
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;