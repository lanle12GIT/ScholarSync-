import React from 'react';

const ExplorerPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      fontSize: '2rem',
      fontWeight: 700,
      color: '#3b82f6',
      fontFamily: "'Inter', sans-serif",
    }}>
      Hello Explorer
    </div>
  );
};

export default ExplorerPage;
