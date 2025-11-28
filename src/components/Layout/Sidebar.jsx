import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  WorkOutline,
  SmartToy,
  Description,
  MenuBook,
  ShowChart,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
  },
  {
    title: 'Workflows',
    path: '/workflows',
    icon: WorkOutline,
  },
  {
    divider: true,
    label: 'AI Agenten',
  },
  {
    title: 'Personal Assistant',
    path: '/agents/personal',
    icon: SmartToy,
  },
  {
    title: 'Frontend Generator',
    path: '/agents/frontend',
    icon: SmartToy,
  },
  {
    divider: true,
    label: 'Verwaltung',
  },
  {
    title: 'Dokumente',
    path: '/documents',
    icon: Description,
  },
  {
    title: 'Knowledge Base',
    path: '/knowledge',
    icon: MenuBook,
  },
  {
    title: 'Token Usage',
    path: '/tokens',
    icon: ShowChart,
  },
  {
    divider: true,
  },
  {
    title: 'Einstellungen',
    path: '/settings',
    icon: Settings,
  },
];

function Sidebar({ open, collapsed, onClose, isMobile, width, collapsedWidth }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerWidth = collapsed ? collapsedWidth : width;

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box sx={{ height: 64 }} /> {/* Spacer for AppBar */}
      
      <List>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={`divider-${index}`}>
                <Divider sx={{ my: 1 }} />
                {item.label && !collapsed && (
                  <Box sx={{ px: 2, py: 1 }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'caption',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                    </motion.div>
                  </Box>
                )}
              </Box>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          const button = (
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <Icon />
              </ListItemIcon>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItemText primary={item.title} />
                </motion.div>
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding>
              {collapsed ? (
                <Tooltip title={item.title} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;