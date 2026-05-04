import React from 'react';

const TopicsPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      fontSize: '2rem',
      fontWeight: 700,
      color: '#8b5cf6',
      fontFamily: "'Inter', sans-serif",
    }}>
      Hello Topics
    </div>
  );
};

export default TopicsPage;
