import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, ReadOutlined } from '@ant-design/icons';
import { authApi } from '../api/authApi';
import './AuthPage.css';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');

  // Xóa lỗi của 1 field khi người dùng bắt đầu gõ lại
  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const switchTab = (path: string) => {
    setFieldErrors({});
    setApiError('');
    navigate(path);
  };

  // Kiểm tra phía client trước khi gọi API: hiển thị lỗi đỏ ngay dưới từng ô
  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!isLogin && !username.trim()) {
      errors.username = 'Please enter your username.';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (!isLogin) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match!';
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!isLogin) {
      // Call register API
      setLoading(true);
      try {
        await authApi.register({ userName: username, email, password });
        // Registration successful -> redirect to login
        navigate('/login');
      } catch (err: any) {
        // err is already unwrapped by axiosClient interceptor = error.response.data (string or object)
        const msg = typeof err === 'string' ? err : (err?.message || '');
        if (msg.includes('Email is already in use')) {
          setFieldErrors({ email: 'This email is already in use!' });
        } else if (msg.includes('Username is already taken')) {
          setFieldErrors({ username: 'Username is already taken!' });
        } else {
          setApiError(msg || 'An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Call login API
      setLoading(true);
      try {
        const res: any = await authApi.login({ email, password });
        const token = res.token || res.accessToken;
        if (!token) {
          throw new Error('Đăng nhập thất bại: Không nhận được token hợp lệ.');
        }
        Cookies.set('token', token, { expires: 7 }); // expire in 7 days
        if (res.userName) Cookies.set('userName', res.userName, { expires: 7 });
        if (res.email) Cookies.set('userEmail', res.email, { expires: 7 });
        navigate('/dashboard');
      } catch (err: any) {
        const msg = typeof err === 'string' ? err : (err?.message || '');
        const lower = msg.toLowerCase();
        // Bad credentials / generic 401 -> friendly message; keep any other meaningful error as-is.
        if (!msg || lower.includes('bad credentials') || lower.includes('unauthorized') || lower.includes('401')) {
          setApiError('Incorrect email or password.');
        } else {
          setApiError(msg);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div  className="auth-logo">
        <ReadOutlined className="auth-logo-icon" />
        <h3>Scholar Slate</h3>
      </div>
      <div className="auth-card">
        <div className="auth-tabs">
          <div
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab('/login')}
          >
            Login
          </div>
          <div
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab('/register')}
          >
            Register
          </div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create new account'}</h1>
          <p className="auth-subtitle">Access your knowledge treasury</p>
        </div>



        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className={`form-input ${fieldErrors.username ? 'form-input-error' : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearFieldError('username');
                }}
              />
              {fieldErrors.username && <span className="form-error-text">{fieldErrors.username}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
              placeholder="email@scholar-slate.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
            />
            {fieldErrors.email && <span className="form-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              {isLogin && <a href="#" className="forgot-password">Forgot password?</a>}
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-input ${fieldErrors.password ? 'form-input-error' : ''}`}
                placeholder="******"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
            </div>
            {fieldErrors.password && <span className="form-error-text">{fieldErrors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-input ${fieldErrors.confirmPassword ? 'form-input-error' : ''}`}
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </span>
              </div>
              {fieldErrors.confirmPassword && <span className="form-error-text">{fieldErrors.confirmPassword}</span>}
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
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
        <div className="auth-footer">
          By continuing, you agree to our Terms of Service
          and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
