import React from 'react';
import WelComeImage from '../assets/images/Welcome.png';
import Footer from '../components/layout/Footer';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  return (
    <div className="welcome-container">
     <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
      }}
    >
      <img
        src={WelComeImage}
        alt="Theo dõi và tóm tắt paper AI bạn quan tâm"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'cover',
        }}
      />
    </div>
      <Footer />
    </div>
  );
};

export default WelcomePage;

