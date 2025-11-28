//src/components/workflow/WorkflowList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  DeleteOutline,
  PlayArrow,
  CheckCircle,
  ErrorOutline,
  AccessTime,
  MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '../../store/workflowStore'; // Annahme: Store ist aktualisiert
import CreateWorkflowDialog from '../../components/workflow/CreateWorkflowDialog';

function WorkflowList() {
  const navigate = useNavigate();
  // Annahme: Store hat createWorkflow action
  const { workflows, fetchWorkflows, deleteWorkflow, createWorkflow, isLoading, error } = useWorkflowStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreate = async (intent) => {
    setIsCreating(true);
    try {
      const result = await createWorkflow(intent, null);
      setCreateOpen(false);
      // Navigiere direkt zum neuen Workflow zum Genehmigen
      if (result && result.id) {
        navigate(`/workflows/${result.id}`); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      case 'draft': return 'default';
      case 'waiting_confirmation': return 'warning'; // E-Mail Review
      case 'waiting_user_input': return 'secondary'; // Context Injection nötig
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
     switch (status) {
      case 'draft': return 'Entwurf';
      case 'waiting_user_input': return 'Auth erforderlich';
      case 'waiting_confirmation': return 'Bestätigung';
      case 'running': return 'Läuft';
      case 'completed': return 'Fertig';
      case 'failed': return 'Fehler';
      default: return status;
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    w.user_intent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 2 }}>
      {/* Header Area */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Workflows
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verwalten und überwachen Sie Ihre KI-Automatisierungen
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Neuer Workflow
        </Button>
      </Box>

      {/* Filter & Search Bar */}
      <Box display="flex" gap={2} mb={4}>
        <TextField
          placeholder="Suche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ maxWidth: 400, bgcolor: 'background.paper', borderRadius: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <Button startIcon={<Refresh />} onClick={() => fetchWorkflows()}>
          Aktualisieren
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading && workflows.length === 0 ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredWorkflows.map((workflow, index) => (
              <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card 
                    elevation={0}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/workflows/${workflow.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip 
                          label={getStatusLabel(workflow.status)} 
                          color={getStatusColor(workflow.status)} 
                          size="small" 
                          variant={workflow.status === 'running' ? 'filled' : 'outlined'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(workflow.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 64
                      }}>
                        {workflow.user_intent}
                      </Typography>

                      {workflow.status === 'running' && (
                        <Box sx={{ mt: 2 }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption">Fortschritt</Typography>
                            <Typography variant="caption">{workflow.current_step} / {workflow.total_steps}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(workflow.current_step / workflow.total_steps) * 100} 
                            sx={{ borderRadius: 1, height: 6 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                       <Tooltip title="Löschen">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Löschen?')) deleteWorkflow(workflow.id);
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                       </Tooltip>
                       <Button size="small" endIcon={<PlayArrow />} sx={{ ml: 'auto' }}>
                         Details
                       </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <CreateWorkflowDialog 
        open={isCreateOpen} 
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </Box>
  );
}

export default WorkflowList;