import React from 'react';
import { ReadOutlined, MessageOutlined, GlobalOutlined } from '@ant-design/icons';
import '../../pages/WelcomePage.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-logo">
          <ReadOutlined style={{ color: '#00875A' }} /> Scholar Slate
        </div>
        <div className="footer-copyright">
          © 2026 Scholar Slate. All rights reserved.
        </div>
      </div>

      <div className="footer-links">
        <a href="#privacy" className="footer-link">Privacy Policy</a>
        <a href="#terms" className="footer-link">Terms of Service</a>
        <a href="#contact" className="footer-link">Contact Support</a>
      </div>

      <div className="footer-right">
        <GlobalOutlined style={{ color: '#718096', marginRight: '16px', cursor: 'pointer' }} />
        <MessageOutlined style={{ color: '#718096', cursor: 'pointer' }} />
      </div>
    </footer>
  );
};

export default Footer;
