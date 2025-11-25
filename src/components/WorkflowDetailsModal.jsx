// src/components/WorkflowDetailsModal.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const getStepStatusColor = (status) => {
  switch (status) {
    case 'running':
      return 'primary';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'pending':
      return 'default';
    default:
      return 'default';
  }
};

const WorkflowDetailsModal = ({
  open,
  onClose,
  workflowDetails,
  onConfirmStep,
}) => {
  if (!workflowDetails) return null;

  const progressValue =
    (workflowDetails.current_step / workflowDetails.total_steps) * 100 || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Workflow Details
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CancelIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          {/* Status Overview */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status: {workflowDetails.status}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Schritt {workflowDetails.current_step} von{' '}
              {workflowDetails.total_steps}
            </Typography>
          </Box>

          {/* Steps */}
          <Typography variant="h6" gutterBottom>
            Schritte:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {workflowDetails.steps?.map((step, i) => (
              <Card
                key={i}
                variant="outlined"
                sx={{
                  bgcolor:
                    step.status === 'running' ? 'action.hover' : 'background.paper',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={`Schritt ${step.step_number}`}
                      size="small"
                      color={getStepStatusColor(step.status)}
                    />
                    <Chip label={step.type} size="small" variant="outlined" />
                    <Chip label={step.status} size="small" />
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {step.description}
                  </Typography>
                  {step.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {step.error}
                    </Alert>
                  )}
                  {step.result && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        fontSize: '0.875rem',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        Ergebnis:
                      </Typography>
                      <Typography variant="caption" display="block">
                        {JSON.stringify(step.result)?.substring(0, 200)}
                        {JSON.stringify(step.result)?.length > 200 && '...'}
                      </Typography>
                    </Box>
                  )}

                  {/* Confirmation Buttons */}
                  {step.requires_confirmation && step.status !== 'completed' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() =>
                          onConfirmStep(workflowDetails.workflow_id, true)
                        }
                      >
                        Bestätigen
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() =>
                          onConfirmStep(workflowDetails.workflow_id, false)
                        }
                      >
                        Ablehnen
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowDetailsModal;