import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      fontSize: '2rem',
      fontWeight: 700,
      color: '#00875A',
      fontFamily: "'Inter', sans-serif",
    }}>
      Hello Dashboard
    </div>
  );
};

export default DashboardPage;
