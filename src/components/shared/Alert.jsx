import React from 'react';

const Alert = ({ severity = 'info', children, onClose }) => {
  const colors = {
    success: { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32' },
    error: { bg: '#ffebee', border: '#f44336', color: '#c62828' },
    warning: { bg: '#fff3e0', border: '#ff9800', color: '#e65100' },
    info: { bg: '#e3f2fd', border: '#2196f3', color: '#1565c0' },
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      background: colors[severity].bg,
      border: `1px solid ${colors[severity].border}`,
      color: colors[severity].color,
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span>{children}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '1.2rem',
            color: colors[severity].color,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;