import React from 'react';
import Spinner from './Spinner';

const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  fullWidth, 
  disabled, 
  loading, 
  onClick, 
  type,
  ...props 
}) => {
  const baseStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.2s',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const variants = {
    contained: {
      primary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' },
      secondary: { background: '#ff9800', color: 'white' },
      success: { background: '#4caf50', color: 'white' },
      error: { background: '#f44336', color: 'white' },
    },
    outlined: {
      primary: { background: 'transparent', color: '#667eea', border: '2px solid #667eea' },
      secondary: { background: 'transparent', color: '#ff9800', border: '2px solid #ff9800' },
      error: { background: 'transparent', color: '#f44336', border: '2px solid #f44336' },
    },
  };

  const style = { ...baseStyle, ...variants[variant][color] };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={20} />}
      {children}
    </button>
  );
};

export default Button;