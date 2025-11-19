import React from 'react';

const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    ...style,
  }}>
    {children}
  </div>
);

export default Card;