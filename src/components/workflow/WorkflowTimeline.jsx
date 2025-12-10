import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Alert,
  Chip,
} from '@mui/material';
import { 
  CheckCircle, 
  Error, 
  RadioButtonUnchecked, 
  HourglassEmpty,
  Code, 
  Send,
  Description,
  Psychology,
  Search, 
  ContactMail, 
  PictureAsPdf, 
  AltRoute, 
  Article,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWorkflowStore } from '../../store/workflowStore';
import { workflowService } from '../../api/services/workflowService';
import EmailPreviewCard from './EmailPreviewCard';
import UserContextRequestCard from './UserContextRequestCard';
import JobSelectionCard from './JobSelectionCard';
import { agentService } from '../../api/services/agentService'

// =================================================================
// 🚀 Helper-Funktionen
// =================================================================

function StepIcon({ status }) {
  switch (status) {
    case 'completed': return <CheckCircle color="success" />;
    case 'failed': return <Error color="error" />;
    case 'running': return <CircularProgress size={20} />;
    case 'pending_confirmation': return <HourglassEmpty color="warning" />;
    case 'pending': return <HourglassEmpty color="warning" />;
    default: return <RadioButtonUnchecked color="disabled" />;
  }
}

function getToolIcon(name) {
  switch (name) {
    case 'job_search': return Search;
    case 'company_career_contact_finder': return ContactMail;
    case 'user_document_search': return Description;
    case 'user_document_list': return Description;
     case 'user_document_read': return Article;
    case 'PdfGenerator': return PictureAsPdf;
    case 'send_email': return Send;
    case 'web_search': return Search;
    default: return Code; 
  }
}

function formatToolName(name) {
  if (!name) return 'Analyse';
  if (name === 'company_career_contact_finder') return 'Suche Kontaktdaten';
  if (name === 'job_search') return 'Job Suche';
  if (name === 'user_document_list') return 'Dokument suche';
  if (name === 'user_document_read') return 'Dokument lesen';
  if (name === 'user_document_search') return 'Dokument suche';
  if (name === 'send_email') return 'E-Mail';
  if (name === 'PdfGenerator') return 'PDF erstellen';
  if (name === 'web_search') return 'Web-Suche';
  return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
}

function formatResult(result) {
  if (!result) return 'Kein Ergebnis vorhanden.';

  // Falls ein summary vorhanden ist, nur dieses zurückgeben
  if (result.summary && typeof result.summary === 'string') {
    return result.summary
      .split('\n')
      // Entfernt führende * und Leerzeichen
      .map(line => line.replace(/^\s*\*\s*/, ''))
      // Entfernt alle ** (Markdown-Bold)
      .map(line => line.replace(/\*\*/g, ''))
      .join('\n');
  }
 if (typeof result === 'string') return result;
  // Falls ein result-Feld vorhanden ist und ein String ist
  if (result.result && typeof result.result === 'string') {
    return result.result;
  }

  // Fallback: kein summary vorhanden
  return result.data ? JSON.stringify(result.data, null, 2) : JSON.stringify(result, null, 2);
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
          sx={{ mt: 2 }}
          href={match[0]}
          target="_blank"
          startIcon={<Description />}
        >
          Dokument herunterladen
        </Button>
      );
    }
  } catch (e) { }
  return null;
}

// =================================================================
// 🎨 Hauptkomponente: WorkflowTimeline
// =================================================================

// MODIFIZIERUNG: `workflowId` als separater Prop hinzugefügt
export default function WorkflowTimeline({ workflow, workflowId }) {
  // FIX 1: Atomic Selectors verhindern unnötige Re-Renders und Schleifen
  const injectUserContext = useWorkflowStore(state => state.injectUserContext);
  const fetchWorkflow = useWorkflowStore(state => state.fetchWorkflow);
  const sendEmail = useWorkflowStore(state => state.sendEmail);
  const rejectEmail = useWorkflowStore(state => state.rejectEmail);
  const selectJob = useWorkflowStore(state => state.selectJob);
  const isLoading = useWorkflowStore(state => state.isLoading);
  const updateWorkflowData = useWorkflowStore(state => state.updateWorkflowData); // NEU: Selector für Update-Funktion
  // Local State
  const [emailSteps, setEmailSteps] = useState({}); 
  const [error, setError] = useState(null);
  const [loadingStepIds, setLoadingStepIds] = useState(new Set()); // Nur für UI Spinner

  // FIX 2: Ref für Tracking aktiver Requests, um Loop in useEffect zu verhindern
  const loadingTracker = useRef(new Set());
 
  
  const loadEmailDetails = useCallback(async (stepId) => {
 
    if (loadingTracker.current.has(stepId)) return;
    
   
    let alreadyLoaded = false;
    setEmailSteps(prev => {
        if (prev[stepId]) alreadyLoaded = true;
        return prev;
       
    });
    if (alreadyLoaded) return;
    
    // Markieren als ladend
    loadingTracker.current.add(stepId);
    setLoadingStepIds(prev => new Set(prev).add(stepId));
    
    try {
      const details = await workflowService.getStepEmail(stepId);
      setEmailSteps(prev => ({
        ...prev,
        [stepId]: details.email_details
      }));
    } catch (error) {
      console.error('Fehler beim Laden der E-Mail Details:', error);
      // Optional: Globalen Fehler setzen, aber Vorsicht vor UI-Flackern
    } finally {
      // Cleanup
      loadingTracker.current.delete(stepId);
      setLoadingStepIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
  }, []); // Leere Dependency Array -> Stabile Funktion!



  /**
   * Handler
   */
  const handleInjectContext = async () => {
    // WICHTIG: Hier `workflowId` verwenden
    if (!workflowId) return; 
    try {
      await injectUserContext(workflowId);
      setError(null);
    } catch (error) {
      setError('Kontext konnte nicht injiziert werden');
    }
  };

  const handleSendEmail = async (stepId) => {
    try {
      const result = await sendEmail(stepId);
      if (result.success) {
        setEmailSteps(prev => {
          const newState = { ...prev };
          delete newState[stepId];
          return newState;
        });
        setError(null);
      } else {
        setError(result.error || 'E-Mail konnte nicht gesendet werden');
      }
    } catch (error) {
      setError('E-Mail konnte nicht gesendet werden');
    }
  };

  const handleRejectEmail = async (stepId) => {
    try {
      const result = await rejectEmail(stepId);
      if (result.success) {
        setEmailSteps(prev => {
          const newState = { ...prev };
          delete newState[stepId];
          return newState;
        });
        setError(null);
      } else {
        setError(result.error || 'E-Mail konnte nicht abgelehnt werden');
      }
    } catch (error) {
      setError('E-Mail konnte nicht abgelehnt werden');
    }
  };

  const handleSelectJob = useCallback(async (selectedJob) => {
    // WICHTIG: Hier `workflowId` verwenden, die aus dem Parent kommt und immer definiert sein sollte
  
    
    if (!workflowId) {
      // Der Fall, der vorher aufgetreten ist, wird nun von der Parent-Component abgefangen
      // Aber wir fügen den Guard zur Sicherheit hinzu
      return { success: false, error: 'Workflow ID fehlt.' };
    }
    
    try {
      // Der Store-Aufruf ist jetzt sicher
      const result = await selectJob(workflowId, selectedJob); 
      if (!result.success) {
        throw new Error(result.error || 'Job-Auswahl fehlgeschlagen');
      }
      setError(null);
      return { success: true }; 
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [selectJob, workflowId]); // MODIFIZIERUNG: Abhängigkeit auf `workflowId` geändert
  
  // NEU: Polling-Logik für Workflow-Status
  useEffect(() => {
    // 1. Guard: Workflow-Daten und Session ID müssen vorhanden sein
    if (!workflow || !workflow.session_id) return;

    // 2. Guard: Polling nur starten, wenn der Workflow im Laufen ist und nicht abgeschlossen/fehlerhaft
    const isWorkflowActive = workflow.status !== 'completed' && workflow.status !== 'failed' && workflow.status !== 'draft';
    
    if (isWorkflowActive) {
        console.log(`Starte Polling für Session ID: ${workflow.session_id}`);
        
        // Die `pollAgentStatus` Funktion aus `agentService.js` nutzen
        // Der Interval von 2000ms (2s) ist gut für die UI-Aktualisierung.
        const stopPolling = agentService.pollAgentStatus(
            workflow.session_id,
            (statusUpdate) => {
                if (statusUpdate.error) {
                    console.error('Polling Fehler:', statusUpdate.error);
                    // Optional: Error-State in der Komponente setzen
                    return;
                }
                
                // Aktualisiere den globalen Workflow-Zustand (Store)
                // Die `statusUpdate` enthält die neuen Schritte, den Status usw.
                // Es ist wichtig, nur die Workflow-relevanten Daten zu übergeben.
                if (statusUpdate.workflow_id === workflow.workflow_id) {
                    updateWorkflowData({
                        steps: statusUpdate.steps, 
                        status: statusUpdate.status,
                        current_step: statusUpdate.current_step,
                        // ... andere relevante Felder
                    });
                }
            },
            2000 // Interval in Millisekunden
        );

        // Cleanup-Funktion: Stoppt das Polling, wenn die Komponente unmounted
        // oder wenn die Dependencies (workflow.session_id, workflow.status) sich ändern 
        // und die Schleife nicht mehr aktiv sein soll (was durch die Guards oben gesteuert wird).
        return stopPolling;
    }
  }, [workflow?.session_id, workflow?.status, workflow?.workflow_id, updateWorkflowData]); // Dependencies für Polling-Start/Stopp
  // FIX 3: E-Mail Details laden, sobald ein Schritt die Bestätigung benoetigt
  useEffect(() => {
    if (!workflow || !workflow.steps) return;
 
    workflow.steps.forEach(step => {
      const needsConfirmation = 
        step.status === 'pending_confirmation' && 
        step.requires_confirmation && 
        step.tool_name === 'send_email';
 
      if (needsConfirmation) {
        // Ruft die Funktion auf, um die Details fuer diesen Schritt zu laden
        loadEmailDetails(step.id);
      }
    });
  },[workflow, loadEmailDetails]);
  // Guards
  if (!workflow) return <Alert severity="info">Workflow-Daten werden geladen...</Alert>;
  if (!workflow.steps || workflow.steps.length === 0) return <Alert severity="warning">Dieser Workflow hat noch keine Schritte.</Alert>;
  console.log(workflow)
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {workflow.status === 'waiting_user_input' && (
        <Box mb={3}>
          <UserContextRequestCard onConnect={handleInjectContext} isLoading={false} />
        </Box>
      )}

      <Stepper 
        activeStep={(workflow.current_step || 1) - 1} 
        orientation="vertical"
        sx={{ '& .MuiStepConnector-line': { minHeight: 30 } }}
      >
        {workflow.steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          const isRunning = step.status === 'running';
          const needsConfirmation = step.status === 'pending_confirmation' && step.requires_confirmation && step.tool_name ==='send_email';
          const isPendingDecision = step.status === 'pending_confirmation' && step.requires_confirmation && !step.tool_name; 
           
          let ToolIcon = Psychology;
 
        
          if (step.tool_name) {
             ToolIcon = getToolIcon(step.tool_name);
          }
          if (isPendingDecision) ToolIcon = AltRoute; 
          
          const toolChipColor = step.description.split(':')[1]?.trim() ? 'action.selected' : 'info.main';

          return (
            <Step key={step.id} expanded={true}>
              <StepLabel
                icon={<StepIcon status={step.status} />}
                optional={
                  <Box display="flex" alignItems="center" gap={1}>
                    {step.description.includes(':') && (
                        <Chip
                            size="small"
                            label={formatToolName(step.description.split(':')[1]?.trim())}
                            sx={{ 
                                bgcolor: toolChipColor, 
                                color: theme => theme.palette.mode === 'dark' ? 'white' : 'black',
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                  </Box>
                }
              >
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                  {React.createElement(ToolIcon, { sx: { fontSize: 24 } })}
                  Schritt {step.step_number}: 
                  {isPendingDecision 
                    ? 'Entscheidung ausstehend' 
                    : step.tool_name 
                      ? formatToolName(step.tool_name) 
                      : step.description} 
                </Typography>
              </StepLabel>
              
              <StepContent>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box>
                    {/* Result */}
                    {isCompleted && step.result && (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.lighter', borderColor: 'success.main' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight="bold">Ergebnis</Typography>
                        </Box>
                        <Typography 
                          variant="body2" component="pre"
                          sx={{  fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflow: 'auto', p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}
                        >

                          {formatResult(step.result)} 

                        </Typography>
                        {checkPdfResult(step)}
                      </Paper>
                    )}

                    
                    {isFailed && step.error_message && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Fehler aufgetreten</Typography>
                        <Typography variant="body2">{step.error_message}</Typography>
                      </Alert>
                    )}

                    {/* Running */}
                    {isRunning && (
                      <Box display="flex" alignItems="center" gap={2} p={2} mb={2}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="text.secondary">Wird ausgeführt...</Typography>
                      </Box>
                    )}
                   
                    
                    {/* Email Preview */}

                    {needsConfirmation  &&(
                      <Box mb={2}>
                        <EmailPreviewCard 
                          stepId={step.id}
                          emailDetails={emailSteps[step.id]}
                          onSend={() => handleSendEmail(step.id)}
                          onReject={() => handleRejectEmail(step.id)}
                          isLoading={loadingStepIds.has(step.id)} 
                        />
                      </Box>
                    )}
                    
                    {/* Job Selection */}
                    {isPendingDecision && (
                      <Box mb={2}>
                        <JobSelectionCard
                          availableJobs={workflow.steps[index-1].result?.data.data.stellenangebote || []}
                          onSelect={handleSelectJob}
                          stepDescription={step.description?.split(':')[0]?.trim() || 'Bitte wählen Sie eine Option.'}
                          isLoading={isLoading} 
                        />
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}