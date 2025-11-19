import React from 'react';

const Spinner = ({ size = 40 }) => (
  <div style={{
    width: size,
    height: size,
    border: '3px solid rgba(0,0,0,0.1)',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }} />
);

export default Spinner;