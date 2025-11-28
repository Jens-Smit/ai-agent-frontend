import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  SmartToy,
  WorkOutline,
  Description,
  MenuBook,
  TrendingUp,
  ArrowForward,
  CheckCircle,
  HourglassEmpty,
  Error,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../store/workflowStore';
import { tokenService } from '../api/services/tokenService';
import { documentService } from '../api/services/documentService';

function Dashboard() {
  const navigate = useNavigate();
  const { workflows, fetchWorkflows } = useWorkflowStore();
  const [tokenUsage, setTokenUsage] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await fetchWorkflows(null, 5);
      
      const usage = await tokenService.getUsage('day');
      setTokenUsage(usage.data);
      
      const storage = await documentService.getStorageStats();
      setStorageStats(storage.storage);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Personal Assistant',
      description: 'Starten Sie einen intelligenten Assistenten',
      icon: SmartToy,
      color: 'primary',
      path: '/agents/personal',
    },
    {
      title: 'Neues Dokument',
      description: 'Dokument hochladen und verwalten',
      icon: Description,
      color: 'secondary',
      path: '/documents',
    },
    {
      title: 'Knowledge Base',
      description: 'Wissensbasis durchsuchen',
      icon: MenuBook,
      color: 'info',
      path: '/knowledge',
    },
    {
      title: 'Workflows',
      description: 'Workflows verwalten',
      icon: WorkOutline,
      color: 'success',
      path: '/workflows',
    },
  ];

  const getWorkflowStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'running':
        return <HourglassEmpty color="info" />;
      default:
        return <HourglassEmpty color="action" />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Willkommen zurück! Hier ist eine Übersicht Ihrer Aktivitäten.
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <action.icon
                      sx={{
                        fontSize: 40,
                        color: `${action.color}.main`,
                        mr: 2,
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Workflows */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Aktuelle Workflows
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate('/workflows')}
              >
                Alle anzeigen
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {workflows && workflows.length > 0 ? (
              <List>
                {workflows.slice(0, 5).map((workflow) => (
                  <ListItem
                    key={workflow.id}
                    button
                    onClick={() => navigate(`/workflows/${workflow.session_id}`)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      {getWorkflowStatusIcon(workflow.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={workflow.user_intent}
                      secondary={`Status: ${workflow.status} • ${new Date(workflow.created_at).toLocaleDateString()}`}
                    />
                    <Chip
                      label={`${workflow.current_step || 0}/${workflow.steps_count}`}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Keine Workflows vorhanden
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* Token Usage */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Token Usage (Heute)
                  </Typography>
                </Box>
                
                {tokenUsage && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Gesamt Tokens
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {tokenUsage.total_tokens?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Input Tokens
                      </Typography>
                      <Typography variant="body1">
                        {tokenUsage.total_input_tokens?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Output Tokens
                      </Typography>
                      <Typography variant="body1">
                        {tokenUsage.total_output_tokens?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/tokens')}
                >
                  Details anzeigen
                </Button>
              </Paper>
            </Grid>

            {/* Storage */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Description sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Speicher
                  </Typography>
                </Box>
                
                {storageStats && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Verwendet
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {storageStats.used_human}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Dokumente
                      </Typography>
                      <Typography variant="body1">
                        {storageStats.document_count}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Auslastung
                      </Typography>
                      <Typography variant="body1">
                        {storageStats.usage_percent?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/documents')}
                >
                  Dokumente verwalten
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;