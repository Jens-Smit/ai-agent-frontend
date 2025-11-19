import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const agents = [
    {
      title: 'Personal Assistant',
      description: 'Dein persönlicher AI Assistent für alltägliche Aufgaben',
      icon: '🤖',
      path: '/agent',
      color: '#667eea',
    },
    {
      title: 'Development Agent',
      description: 'Generiert Symfony/PHP Code mit Tests',
      icon: '💻',
      path: '/dev-agent',
      color: '#ff9800',
    },
    {
      title: 'Frontend Generator',
      description: 'Erstellt React Frontend-Anwendungen',
      icon: '🎨',
      path: '/frontend-agent',
      color: '#4caf50',
    },
  ];

  return (
    <div>
      <Card style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        marginBottom: '32px' 
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2.5rem' }}>Willkommen zurück! 👋</h1>
        <p style={{ margin: '0 0 8px', opacity: 0.9 }}>{user?.email}</p>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
          Wähle einen AI Agent aus
        </p>
      </Card>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {agents.map((agent, index) => (
          <Card 
            key={index} 
            style={{ 
              cursor: 'pointer', 
              transition: 'transform 0.2s',
            }}
          >
            <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '16px' }}>
              {agent.icon}
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', color: agent.color }}>
              {agent.title}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#666', lineHeight: 1.6 }}>
              {agent.description}
            </p>
            <Button fullWidth onClick={() => navigate(agent.path)}>
              Starten
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;