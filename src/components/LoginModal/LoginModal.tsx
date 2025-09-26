import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSignIn from '../GoogleSignIn/GoogleSignIn';
import { X } from 'lucide-react';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signup(formData.username, formData.email, formData.password);
      } else {
        result = await login(formData.username, formData.password, formData.rememberMe);
      }

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={e => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          <button className="login-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="login-modal-body">
          {/* Google Sign-In */}
          <div className="google-signin-section">
            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              buttonSize="large"
              buttonTheme="outline"
            />
          </div>

          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Traditional Login/Signup Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your username"
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isSignUp && (
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  Remember me
                </label>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="login-switch">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                className="switch-mode-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setFormData({ username: '', email: '', password: '', rememberMe: false });
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;