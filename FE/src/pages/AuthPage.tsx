import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, GoogleOutlined, FacebookFilled, ReadOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error messages
  const [confirmError, setConfirmError] = useState('');
  const [apiError, setApiError] = useState('');
  const [emailError, setEmailError] = useState(false);

  const switchTab = (path: string) => {
    setConfirmError('');
    setApiError('');
    navigate(path);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmError('');
    setApiError('');
    setEmailError(false);

    if (!isLogin) {
      // Kiểm tra mật khẩu nhập lại
      if (password !== confirmPassword) {
        setConfirmError('Mật khẩu nhập lại không khớp!');
        return;
      }

      // Gọi API đăng ký
      setLoading(true);
      try {
        await authApi.register({ userName: username, email, password });
        // Đăng ký thành công -> chuyển sang trang đăng nhập
        navigate('/login');
      } catch (err: any) {
        // err đã được axiosClient interceptor bóc sẵn = error.response.data (chuỗi hoặc object)
        const msg = typeof err === 'string' ? err : (err?.message || '');
        if (msg.includes('Email is already in use')) {
          setApiError('Email này đã được sử dụng!');
          setEmailError(true);
        } else if (msg.includes('Username is already taken')) {
          setApiError('Tên tài khoản đã tồn tại!');
        } else {
          setApiError(msg || 'Đã có lỗi xảy ra, vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Gọi API đăng nhập
      setLoading(true);
      try {
        const res: any = await authApi.login({ email, password });
        localStorage.setItem('token', res.token || res.accessToken || 'fake-token');
        navigate('/dashboard');
      } catch (err: any) {
        const msg = typeof err === 'string' ? err : (err?.message || '');
        setApiError(msg || 'Email hoặc mật khẩu không đúng.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="auth-logo">
        <ReadOutlined className="auth-logo-icon" />
        <span>Scholar Slate</span>
      </Link>
      <div className="auth-card">
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab('/login')}
          >
            Đăng nhập
          </div>
          <div 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab('/register')}
          >
            Đăng ký
          </div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1>
          <p className="auth-subtitle">Truy cập vào kho tàng trí thức của bạn</p>
        </div>

        

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Tên tài khoản</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Nhập tên tài khoản" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className={`form-input ${emailError ? 'form-input-error' : ''}`}
              placeholder="email@scholar-slate.com" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError(false);
                  setApiError('');
                }
              }}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Mật khẩu</label>
              {isLogin && <a href="#" className="forgot-password">Quên mật khẩu?</a>}
            </div>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Nhập lại mật khẩu</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className={`form-input ${confirmError ? 'form-input-error' : ''}`}
                  placeholder="******" 
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError('');
                  }}
                  required
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              </div>
              {confirmError && <span className="form-error-text">{confirmError}</span>}
            </div>
          )}
          {apiError && (
          <div className="auth-error">* {apiError}</div>
        )}

          <Button 
            type="primary" 
            htmlType="submit" 
            className="auth-submit-btn"
            size="large"
            loading={loading}
            style={{fontWeight: 600 }}
          >
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
        </form>
        <div className="auth-footer">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ
          và Chính sách Bảo mật của chúng tôi.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
