import React from 'react';

const FavoritesPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 64px)',
      fontSize: '2rem',
      fontWeight: 700,
      color: '#ef4444',
      fontFamily: "'Inter', sans-serif",
    }}>
      Hello Favorites
    </div>
  );
};

export default FavoritesPage;
