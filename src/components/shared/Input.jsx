import React from 'react';

const Input = ({ 
  label, 
  error, 
  helperText, 
  fullWidth, 
  type = 'text', 
  ...props 
}) => {
  return (
    <div style={{ marginBottom: '16px', width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '0.9rem', 
          fontWeight: 500, 
          color: '#333' 
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: error ? '2px solid #f44336' : '2px solid #e0e0e0',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        {...props}
      />
      {(error || helperText) && (
        <p style={{ 
          margin: '4px 0 0', 
          fontSize: '0.85rem', 
          color: error ? '#f44336' : '#666' 
        }}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;