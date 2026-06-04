import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button, Input, Badge, Dropdown, Avatar } from 'antd';
import { ReadOutlined, LogoutOutlined, DashboardOutlined, CompassOutlined, TagsOutlined, HeartOutlined, SearchOutlined, BellOutlined, LoginOutlined, UserOutlined, DownOutlined } from '@ant-design/icons';
import '../../pages/WelcomePage.css';
import { notificationApi } from '../../api/notificationApi';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlined /> },
  { label: 'Topics', path: '/topics', icon: <TagsOutlined /> },
  { label: 'Paper', path: '/paper', icon: <CompassOutlined /> },
  { label: 'Favorites', path: '/favorites', icon: <HeartOutlined /> },
];

const Navbar: React.FC = () => {
  // Mock user state as planned
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userName');
    Cookies.remove('userEmail');
    setHasToken(false);
    navigate('/');
  };

  useEffect(() => {
    // Check token from localStorage
    const token = Cookies.get('token');
    setHasToken(!!token);

    if (token) {
      setUserName(Cookies.get('userName') || 'User');
      setUserEmail(Cookies.get('userEmail') || '');
      notificationApi.getUserNotifications()
        .then(notifications => {
          const count = notifications.filter(n => n.isRead === 0).length;
          setUnreadCount(count);
        })
        .catch(err => console.error("Failed to fetch notifications:", err));
    }
  }, [location.pathname]); // Update on route change

  // Do not display Navbar on login/register page if not logged in
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login';
  if (isAuthPage && !hasToken) {
    return null;
  }

  return (
    <nav className="navbar-container">
      <div className="navbar-top">
        <div className="nav-logo" style={{ textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <ReadOutlined className="nav-logo-icon" style={{ color: '#00529c', fontSize: '2.5rem', marginRight: '10px' }}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00529c', margin: 0, textTransform: 'uppercase', lineHeight: 1.2 }}>Scholar Slate</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e65c00', textTransform: 'uppercase', lineHeight: 1.2 }}>Research Management</span>
          </div>
        </div>
        
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {hasToken ? (
            <Dropdown 
              menu={{ 
                items: [
                  {
                    key: 'account',
                    icon: <UserOutlined style={{ fontSize: '16px' }}/>,
                    label: <span style={{ fontSize: '14px', color: '#374151' }}>Account</span>,
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ef4444' }}/>,
                    label: <span style={{ fontSize: '14px', color: '#ef4444' }}>Sign out</span>,
                    onClick: handleLogout
                  },
                ] 
              }} 
              trigger={['click']} 
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.2s' }} className="nav-profile-trigger">
                <span style={{ fontSize: '14px', color: '#333' }}>Hello, <strong style={{ color: '#00529c' }}>{userName}</strong></span>
                <Avatar size={36} style={{ backgroundColor: '#4e89e7ff', color: '#f8fafc', fontWeight: 600 }}>
                  {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
                </Avatar>
                <DownOutlined style={{ fontSize: '12px', color: '#666' }} />
              </div>
            </Dropdown>
          ) : (
            <Button type="primary" size="large" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </div>
      </div>

      {hasToken && (
        <div className="navbar-bottom" style={{ justifyContent: 'center', gap: '10rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <span className="nav-menu-divider">|</span>
            {navItems.map((item, index) => (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
                {index < navItems.length  && <span className="nav-menu-divider">|</span>}
              </React.Fragment>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Input 
              className="custom-search-input"
              size="large" 
              placeholder="Search keywords/topics..." 
              prefix={<SearchOutlined style={{ color: '#222121ff', fontSize: '16px' }} />} 
              style={{ borderRadius: 8, width: '400px' }}
              onPressEnter={(e: any) => {
                const val = e.target.value.trim();
                if (val) {
                  navigate(`/paper?keyword=${encodeURIComponent(val)}`);
                } else {
                  navigate('/paper');
                }
              }}
            />
            <Badge count={unreadCount} size="small">
              <Link to="/notifications" style={{ color: 'inherit' }}>
                <BellOutlined style={{ fontSize: '20px', color: '#1f1f1f', cursor: 'pointer' }} />
              </Link>
            </Badge>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
