import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ReadOutlined, LogoutOutlined, DashboardOutlined, CompassOutlined, TagsOutlined, HeartOutlined } from '@ant-design/icons';
import '../../pages/WelcomePage.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
  { label: 'Explorer', path: '/explorer', icon: <CompassOutlined /> },
  { label: 'Topics', path: '/topics', icon: <TagsOutlined /> },
  { label: 'Favorites', path: '/favorites', icon: <HeartOutlined /> },
];

const Navbar: React.FC = () => {
  // Giả định state cho người dùng như kế hoạch
  const [userName] = useState<string>('Nguyễn Văn A');
  const location = useLocation();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState<boolean>(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setHasToken(false);
    navigate('/');
  };

  useEffect(() => {
    // Kiểm tra token từ localStorage
    const token = localStorage.getItem('token');
    setHasToken(!!token);
  }, [location.pathname]); // Update on route change

  // Không hiển thị Navbar trên trang login/register nếu chưa đăng nhập
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login';
  if (isAuthPage && !hasToken) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <ReadOutlined className="nav-logo-icon" />
          <span>Scholar Slate</span>
        </Link>
        
        {hasToken && (
          <>
            <div className="nav-links">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
            
          </>
        )}
      </div>
      <div className="nav-right">
        {hasToken ? (
          <>
          <span className="nav-hello">Chào {userName}</span>
          <Button type="primary" size="large" icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="primary" size="large" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
