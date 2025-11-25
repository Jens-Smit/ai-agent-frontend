// src/components/WorkflowCard.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Stop as StopIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const getStatusColor = (status) => {
  switch (status) {
    case 'running':
      return 'primary';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'waiting_confirmation':
      return 'warning';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'running':
      return <PlayIcon />;
    case 'completed':
      return <CheckIcon />;
    case 'failed':
      return <ErrorIcon />;
    case 'waiting_confirmation':
      return <PauseIcon />;
    case 'cancelled':
      return <CancelIcon />;
    default:
      return null;
  }
};

const WorkflowCard = ({ workflow, onShowDetails, onCancel, onDelete }) => {
  const progressValue =
    (workflow.current_step / workflow.steps_count) * 100 || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8,
          },
        }}
        onClick={() => onShowDetails(workflow)}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom noWrap>
              {workflow.user_intent?.substring(0, 50)}
              {workflow.user_intent?.length > 50 && '...'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={getStatusIcon(workflow.status)}
                label={workflow.status}
                size="small"
                color={getStatusColor(workflow.status)}
              />
              <Typography variant="caption" color="text.secondary">
                Schritt {workflow.current_step}/{workflow.steps_count}
              </Typography>
            </Box>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Fortschritt
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {Math.round(progressValue)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Timestamps */}
          <Box sx={{ mb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Erstellt: {new Date(workflow.created_at).toLocaleString('de-DE')}
            </Typography>
            {workflow.completed_at && (
              <Typography variant="caption" color="text.secondary" display="block">
                Abgeschlossen: {new Date(workflow.completed_at).toLocaleString('de-DE')}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box
            sx={{ display: 'flex', gap: 1 }}
            onClick={(e) => e.stopPropagation()} // Verhindert das Öffnen der Details
          >
            {workflow.status === 'running' && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<StopIcon />}
                onClick={() => onCancel(workflow.id)}
                fullWidth
              >
                Abbrechen
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(workflow.id)}
              fullWidth
            >
              Löschen
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkflowCard;