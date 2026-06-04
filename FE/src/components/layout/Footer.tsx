import React from 'react';
import { ReadOutlined, MessageOutlined, GlobalOutlined } from '@ant-design/icons';
import '../../pages/WelcomePage.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-logo">
          <ReadOutlined style={{ color: '#2a3ba0ff' }} />Scholar Slate
        </div>
        <div className="footer-copyright">
          2026_LETHILAN_24880226
        </div>
      </div>

      <div className="footer-links">
        <span style={{ color: '#718096', fontSize: '0.9rem' }}>Powered by</span>
        <a href="https://arxiv.org" target="_blank" rel="noopener noreferrer" className="footer-link">arXiv.org</a>
        <span style={{ color: '#cbd5e0' }}>•</span>
        <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="footer-link">Google Gemini</a>
      </div>

      <div className="footer-right">
        <GlobalOutlined style={{ color: '#718096', marginRight: '16px', cursor: 'pointer' }} />
        <MessageOutlined style={{ color: '#718096', cursor: 'pointer' }} />
      </div>
    </footer>
  );
};

export default Footer;
