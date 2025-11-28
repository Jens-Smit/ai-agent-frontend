import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Paper, 
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  RadioButtonUnchecked, 
  PlayCircleFilled 
} from '@mui/icons-material';
import { useWorkflowStore } from '../../store/workflowStore';
import { workflowService } from '../../api/services/workflowService';
import EmailPreviewCard from './EmailPreviewCard';
import UserContextRequestCard from './UserContextRequestCard';

export default function WorkflowTimeline({ workflow }) {
  // 🛑 FIX: ALLE HOOKS MÜSSEN AM ANFANG STEHEN
  const { injectUserContext, fetchWorkflow } = useWorkflowStore();
  const [activeEmailStep, setActiveEmailStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Finde aktuellen Step (muss jetzt auch nach den Hooks stehen)
  // Hier ist der "optional chaining"-Operator (?) beim `workflow` wichtig, 
  // da `workflow` an dieser Stelle noch `null` sein könnte.
  const currentStepData = workflow?.steps?.find(
    s => s.step_number === workflow.current_step
  );
  
  // Lade Email-Details wenn nötig
  // ✅ Dieser Hook wird nun in jedem Render-Durchlauf aufgerufen.
  useEffect(() => {
    const loadEmailDetails = async () => {
      if (
        currentStepData?.status === 'pending_confirmation' && 
        currentStepData?.tool_name?.includes('send_email')
      ) {
        try {
          const details = await workflowService.getStepEmail(currentStepData.id);
          setActiveEmailStep({ 
            ...currentStepData, 
            emailDetails: details.email_details 
          });
        } catch (error) {
          console.error('Fehler beim Laden der E-Mail Details:', error);
        }
      } else {
        setActiveEmailStep(null);
      }
    };

    // Führe die Funktion nur aus, wenn currentStepData existiert
    if (currentStepData) {
        loadEmailDetails();
    }
  }, [currentStepData?.id, currentStepData?.status]);

  // Handler
  const handleInjectContext = async () => {
    if (!workflow?.id) {
      console.error('Workflow ID fehlt');
      return;
    }
    
    setIsLoading(true);
    try {
      await injectUserContext(workflow.id);
    } catch (error) {
      console.error('Fehler beim Kontext-Injection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!activeEmailStep?.id) return;
    
    setIsLoading(true);
    try {
      await workflowService.sendEmail(activeEmailStep.id);
      await fetchWorkflow(workflow.id);
      setActiveEmailStep(null);
    } catch (error) {
      console.error('Fehler beim E-Mail Senden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectEmail = async () => {
    if (!activeEmailStep?.id) return;
    
    setIsLoading(true);
    try {
      await workflowService.rejectEmail(activeEmailStep.id);
      await fetchWorkflow(workflow.id);
      setActiveEmailStep(null);
    } catch (error) {
      console.error('Fehler beim E-Mail Ablehnen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🛑 FIX: BEDINGTER RETURN KOMMT NACH ALLEN HOOKS
  // Sicherheitsprüfung
  if (!workflow) {
    return (
      <Alert severity="info">
        Workflow-Daten werden geladen...
      </Alert>
    );
  }
 
  // Wenn keine Steps vorhanden
  if (!workflow.steps || workflow.steps.length === 0) {
    return (
      <Alert severity="warning">
        Dieser Workflow hat noch keine Schritte definiert.
      </Alert>
    );
  }

  return (
    <Box>
      <Stepper 
        activeStep={(workflow.current_step || 1) - 1} 
        orientation="vertical"
      >
        {workflow.steps.map((step) => (
          <Step key={step.id} expanded={true}>
            <StepLabel
              icon={
                step.status === 'completed' ? (
                  <CheckCircle color="success" />
                ) : step.status === 'failed' ? (
                  <Error color="error" />
                ) : step.status === 'running' ? (
                  <CircularProgress size={20} />
                ) : (
                  <RadioButtonUnchecked color="disabled" />
                )
              }
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight="bold">
                  Schritt {step.step_number}: {formatToolName(step.tool_name)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatStatus(step.status)}
                </Typography>
              </Box>
            </StepLabel>
            
            <StepContent>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {step.description || 'Keine Beschreibung verfügbar'}
              </Typography>
              
              {/* Ergebnis bei erfolgreichem Abschluss */}
              {step.status === 'completed' && step.result && (
                <Paper 
                  variant="outlined" 
                  sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {formatResult(step)}
                  </Typography>
                  {checkPdfResult(step)}
                </Paper>
              )}

              {/* Fehlerinfo */}
              {step.status === 'failed' && step.error_message && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {step.error_message}
                </Alert>
              )}

              {/* Aktionen nur beim aktuellen Step */}
              {step.step_number === workflow.current_step && (
                <Box mt={2}>
                  {/* User-Kontext erforderlich */}
                  {workflow.status === 'waiting_user_input' && (
                    <UserContextRequestCard 
                      onConnect={handleInjectContext}
                      isLoading={isLoading}
                    />
                  )}

                  {/* E-Mail Bestätigung */}
                  {workflow.status === 'waiting_confirmation' && activeEmailStep && (
                    <EmailPreviewCard 
                      stepId={activeEmailStep.id}
                      emailDetails={activeEmailStep.emailDetails}
                      onSend={handleSendEmail}
                      onReject={handleRejectEmail}
                      isLoading={isLoading}
                    />
                  )}
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

// Helper Funktionen (unverändert)
function formatToolName(name) {
  if (!name) return 'Analyse / Planung';
  if (name === 'send_email') return 'E-Mail Vorbereitung';
  if (name === 'PdfGenerator') return 'PDF Generierung';
  return name.replace(/_/g, ' ');
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Ausstehend',
    'running': 'Läuft',
    'completed': 'Abgeschlossen',
    'failed': 'Fehlgeschlagen',
    'pending_confirmation': 'Wartet auf Bestätigung',
    'skipped': 'Übersprungen'
  };
  return statusMap[status] || status;
}

function formatResult(step) {
  if (!step.result) return 'Kein Ergebnis vorhanden.';
  
  // Bereits ein String
  if (typeof step.result === 'string') return step.result;

  // Verschachteltes Result-Objekt
  if (step.result?.result && typeof step.result.result === 'string') {
    return step.result.result;
  }
  
  // JSON-Objekt formatieren
  try {
    return JSON.stringify(step.result, null, 2);
  } catch (e) {
    return 'Fehler bei der Anzeige des Ergebnisses';
  }
}

function checkPdfResult(step) {
  try {
    const resultStr = JSON.stringify(step.result);
    const match = resultStr.match(/\/api\/documents\/(\d+)\/download/);
    
    if (match) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          sx={{ mt: 1 }}
          href={match[0]}
          target="_blank"
        >
          📄 Dokument herunterladen
        </Button>
      );
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}