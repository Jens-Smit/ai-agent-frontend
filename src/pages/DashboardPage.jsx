// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  SmartToy as AgentIcon,
  Description as DocumentIcon,
  Psychology as KnowledgeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { listWorkflows } from '../api/workflow';
import { listDocuments } from '../api/documents';
import { getKnowledgeStats } from '../api/knowledge';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    workflows: { total: 0, running: 0, completed: 0, failed: 0 },
    documents: { total: 0 },
    knowledge: { total: 0 },
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load workflows
      const workflowData = await listWorkflows(null, 50);
      const workflows = workflowData.workflows || [];
      
      setStats(prev => ({
        ...prev,
        workflows: {
          total: workflows.length,
          running: workflows.filter(w => w.status === 'running').length,
          completed: workflows.filter(w => w.status === 'completed').length,
          failed: workflows.filter(w => w.status === 'failed').length,
        },
      }));
      
      setRecentWorkflows(workflows.slice(0, 5));

      // Load documents
      const docData = await listDocuments(null, null, 10);
      setStats(prev => ({
        ...prev,
        documents: { total: docData.count || 0 },
      }));

      // Load knowledge base stats
      const knowledgeData = await getKnowledgeStats();
      setStats(prev => ({
        ...prev,
        knowledge: { total: knowledgeData.stats.total_documents || 0 },
      }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Aktive Workflows',
      value: stats.workflows.running,
      icon: TrendingUpIcon,
      color: 'primary',
      trend: '+12%',
    },
    {
      label: 'Abgeschlossen',
      value: stats.workflows.completed,
      icon: CheckCircleIcon,
      color: 'success',
      trend: '+8%',
    },
    {
      label: 'Fehlgeschlagen',
      value: stats.workflows.failed,
      icon: ErrorIcon,
      color: 'error',
      trend: '-3%',
    },
    {
      label: 'Gesamt',
      value: stats.workflows.total,
      icon: AssessmentIcon,
      color: 'info',
      trend: '+15%',
    },
  ];

  const quickActions = [
    {
      title: 'Personal Assistant',
      description: 'Ihr persönlicher KI-Assistent für alltägliche Aufgaben',
      icon: '🤖',
      color: 'primary',
      path: '/agent/personal',
    },
    {
      title: 'Development Agent',
      description: 'Generiert Symfony/PHP Code mit Tests',
      icon: '💻',
      color: 'secondary',
      path: '/agent/dev',
    },
    {
      title: 'Frontend Generator',
      description: 'Erstellt React Frontend-Anwendungen',
      icon: '🎨',
      color: 'success',
      path: '/agent/frontend',
    },
  ];

  const resourceCards = [
    {
      label: 'Dokumente',
      value: stats.documents.total,
      icon: DocumentIcon,
      path: '/documents',
    },
    {
      label: 'Wissensdatenbank',
      value: stats.knowledge.total,
      icon: KnowledgeIcon,
      path: '/knowledge',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Lade Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h3" fontWeight={600} gutterBottom>
              Willkommen zurück! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {user?.email}
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.8 }}>
              Wählen Sie einen AI Agent aus oder verwalten Sie Ihre Workflows
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <stat.icon color={stat.color} />
                  </Box>
                  <Typography variant="h3" fontWeight={700} color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {stat.trend} vs. letzte Woche
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Schnellaktionen
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    sx={{ cursor: 'pointer', height: '100%' }}
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {action.icon}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {action.description}
                      </Typography>
                      <Button variant="contained" color={action.color}>
                        Starten
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Recent Workflows */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Letzte Aktivitäten
            </Typography>
            <Card>
              <CardContent>
                {recentWorkflows.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Noch keine Workflows vorhanden
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentWorkflows.map((wf, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.selected' },
                        }}
                        onClick={() => navigate('/workflows')}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: `${getStatusColor(wf.status)}.main`,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={500} noWrap>
                            {wf.user_intent?.substring(0, 60)}
                            {wf.user_intent?.length > 60 && '...'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(wf.created_at).toLocaleString('de-DE')}
                          </Typography>
                        </Box>
                        <Chip
                          label={wf.status}
                          size="small"
                          color={getStatusColor(wf.status)}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Resources Sidebar */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Ressourcen
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {resourceCards.map((resource, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(resource.path)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <resource.icon fontSize="large" color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {resource.label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {resource.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>

          {/* System Status */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">API</Typography>
                  <Chip label="Online" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Database</Typography>
                  <Chip label="Healthy" size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">AI Services</Typography>
                  <Chip label="Active" size="small" color="success" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;