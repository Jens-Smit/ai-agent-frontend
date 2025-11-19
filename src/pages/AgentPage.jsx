import React, { useState } from 'react';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { getErrorMessage } from '../api/client';
import apiClient from '../api/client';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const AgentPage = ({ agentType = 'personal' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const { statuses, completed, result, error: statusError } = useAgentStatus(sessionId);

  const agentConfig = {
    personal: { title: 'Personal Assistant', icon: '🤖', endpoint: '/api/agent' },
    dev: { title: 'Development Agent', icon: '💻', endpoint: '/api/devAgent' },
    frontend: { title: 'Frontend Generator', icon: '🎨', endpoint: '/api/frondend_devAgent' },
  };

  const config = agentConfig[agentType];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    setSessionId(null);

    try {
      const response = await apiClient.post(config.endpoint, { prompt: input });
      
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
        setMessages(prev => [...prev, { 
          text: response.data.message, 
          isUser: false, 
          sessionId: response.data.sessionId 
        }]);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      setMessages(prev => [...prev, { text: `Fehler: ${errMsg}`, isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '3rem' }}>{config.icon}</div>
          <div>
            <h2 style={{ margin: '0 0 8px' }}>{config.title}</h2>
            <p style={{ margin: 0, color: '#666' }}>
              Status: {completed ? '✅ Abgeschlossen' : sessionId ? '🔄 Läuft' : '⚪ Bereit'}
            </p>
          </div>
        </div>
      </Card>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Status Monitor */}
      {sessionId && (
        <Card style={{ marginBottom: '24px', background: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 16px' }}>📊 Status Monitor</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {statuses.map((s, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: '8px 0', 
                  borderLeft: '3px solid #667eea', 
                  paddingLeft: '12px', 
                  marginBottom: '8px', 
                  background: 'white', 
                  borderRadius: '4px' 
                }}
              >
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>{s.message}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>
                  {new Date(s.timestamp).toLocaleString('de-DE')}
                </p>
              </div>
            ))}
          </div>
          {completed && result && <Alert severity="success">{result}</Alert>}
          {statusError && <Alert severity="error">{statusError}</Alert>}
        </Card>
      )}

      {/* Chat Messages */}
      <Card style={{ 
        minHeight: '400px', 
        marginBottom: '16px', 
        maxHeight: '500px', 
        overflowY: 'auto' 
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#999' 
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{config.icon}</div>
            <h3>Starte eine Konversation</h3>
            <p>Stelle eine Frage oder beschreibe deine Aufgabe</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  justifyContent: msg.isUser ? 'flex-end' : 'flex-start', 
                  marginBottom: '16px' 
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: msg.isUser 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#f0f0f0',
                  color: msg.isUser ? 'white' : '#333',
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  {msg.sessionId && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                      Session: {msg.sessionId}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Spinner size={24} />
                <span style={{ color: '#666' }}>Agent wird gestartet...</span>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Input */}
      <Card>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Schreibe eine Nachricht..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #e0e0e0',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} loading={loading}>
            Senden
          </Button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#999' }}>
          Enter zum Senden, Shift+Enter für neue Zeile
        </p>
      </Card>
    </div>
  );
};

export default AgentPage;