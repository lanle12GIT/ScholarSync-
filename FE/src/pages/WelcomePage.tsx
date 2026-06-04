import React from 'react';
import WelComeImage from '../assets/images/Welcome.jpg';
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
        alt="Track and summarize AI papers you care about"
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

