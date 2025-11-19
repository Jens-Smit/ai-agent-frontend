import React, { useState, useEffect } from 'react';
import { 
  createWorkflow, 
  getWorkflowStatus, 
  confirmWorkflowStep, 
  listWorkflows, 
  getWorkflowCapabilities 
} from '../api/workflow';
import { getErrorMessage } from '../api/client';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const WorkflowPage = () => {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [capabilities, setCapabilities] = useState(null);

  useEffect(() => {
    loadCapabilities();
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (currentWorkflow?.session_id) {
      const interval = setInterval(() => {
        pollWorkflowStatus(currentWorkflow.session_id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [currentWorkflow]);

  const loadCapabilities = async () => {
    try {
      const data = await getWorkflowCapabilities();
      setCapabilities(data);
    } catch (err) {
      console.error('Failed to load capabilities:', err);
    }
  };

  const loadWorkflows = async () => {
    try {
      const data = await listWorkflows();
      setWorkflows(data.workflows || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  };

  const pollWorkflowStatus = async (sessionId) => {
    try {
      const data = await getWorkflowStatus(sessionId);
      setWorkflowStatus(data);
      
      if (data.status === 'completed' || data.status === 'failed') {
        setCurrentWorkflow(null);
        loadWorkflows();
      }
    } catch (err) {
      console.error('Failed to poll workflow status:', err);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!intent.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const sessionId = `wf-${Date.now()}`;
      const data = await createWorkflow(intent, sessionId);
      
      setCurrentWorkflow(data);
      setIntent('');
      
      // Start polling status
      setTimeout(() => pollWorkflowStatus(sessionId), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmStep = async (confirmed) => {
    if (!currentWorkflow?.workflow_id) return;

    try {
      await confirmWorkflowStep(currentWorkflow.workflow_id, confirmed);
      pollWorkflowStatus(currentWorkflow.session_id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created': return '🆕';
      case 'running': return '🔄';
      case 'waiting_confirmation': return '⏸️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      default: return '⚪';
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        marginBottom: '24px' 
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2.5rem' }}>🔄 Workflow Manager</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
          Erstelle komplexe Multi-Step Workflows mit AI-Unterstützung
        </p>
      </Card>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Capabilities */}
      {capabilities && (
        <Card style={{ marginBottom: '24px', background: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 12px' }}>🛠️ Verfügbare Tools ({capabilities.tools_count})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {capabilities.tools.map((tool, i) => (
              <span 
                key={i}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#667eea',
                  border: '1px solid #e0e0e0'
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Create Workflow */}
      <Card style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px' }}>Neuen Workflow erstellen</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Workflow Intent (Beschreibe deine Aufgabe)"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="z.B. 'Finde eine Wohnung in Berlin und vereinbare Besichtigungstermine'"
              fullWidth
              disabled={loading}
            />
          </div>
          <Button 
            onClick={handleCreateWorkflow}
            disabled={loading || !intent.trim()}
            loading={loading}
          >
            Starten
          </Button>
        </div>
      </Card>

      {/* Current Workflow Status */}
      {workflowStatus && (
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px' }}>
            {getStatusIcon(workflowStatus.status)} Aktueller Workflow
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#666' }}>Status</p>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {workflowStatus.status} • Schritt {workflowStatus.current_step} / {workflowStatus.total_steps}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              height: '8px',
              background: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                width: `${(workflowStatus.current_step / workflowStatus.total_steps) * 100}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          {/* Steps */}
          <h4 style={{ margin: '0 0 12px' }}>Schritte:</h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {workflowStatus.steps?.map((step, i) => (
              <div 
                key={i}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  background: step.status === 'running' ? '#e3f2fd' : 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {getStepStatusIcon(step.status)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 500 }}>
                      Schritt {step.step_number}: {step.type}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                      {step.description}
                    </p>
                    {step.error && (
                      <p style={{ margin: '8px 0 0', color: '#f44336', fontSize: '0.85rem' }}>❌ Error: {step.error}</p>
)}
{step.result && (
<div style={{
marginTop: '8px',
padding: '8px',
background: '#f5f5f5',
borderRadius: '4px',
fontSize: '0.85rem'
}}>
<strong>Ergebnis:</strong> {JSON.stringify(step.result).substring(0, 200)}...
</div>
)}
</div>
</div>
            {/* Confirmation Buttons */}
            {step.requires_confirmation && step.status === 'waiting_confirmation' && (
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                gap: '8px',
                paddingTop: '12px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <Button 
                  color="success" 
                  onClick={() => handleConfirmStep(true)}
                  style={{ flex: 1 }}
                >
                  ✓ Bestätigen
                </Button>
                <Button 
                  color="error" 
                  onClick={() => handleConfirmStep(false)}
                  style={{ flex: 1 }}
                >
                  ✗ Ablehnen
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )}

  {/* Workflow History */}
  <Card>
    <h3 style={{ margin: '0 0 16px' }}>📜 Workflow-Verlauf</h3>
    {workflows.length === 0 ? (
      <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
        Noch keine Workflows vorhanden
      </p>
    ) : (
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {workflows.map((wf, i) => (
          <div 
            key={i}
            style={{
              padding: '12px',
              marginBottom: '8px',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setCurrentWorkflow(wf);
              pollWorkflowStatus(wf.session_id);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 500 }}>
                  {getStatusIcon(wf.status)} {wf.user_intent?.substring(0, 60)}
                  {wf.user_intent?.length > 60 && '...'}
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                  Schritte: {wf.current_step}/{wf.steps_count} • 
                  Erstellt: {new Date(wf.created_at).toLocaleString('de-DE')}
                </p>
              </div>
              <span style={{
                padding: '4px 12px',
                background: wf.status === 'completed' ? '#4caf50' : 
                           wf.status === 'failed' ? '#f44336' : '#ff9800',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {wf.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
</div>
);
};
export default WorkflowPage;