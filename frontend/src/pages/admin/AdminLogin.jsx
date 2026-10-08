import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validators';

const AdminLogin = () => {
  const { login, logout, user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Administrator Login | BookLoop';
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Administrator email is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'admin') {
        logout();
        setServerError('Access denied. This account does not possess administrator privileges.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error || 'Invalid administrator credentials. Access restricted.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-card-header">
          <div className="admin-shield-icon">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1>System Control Portal</h1>
          <p>BookLoop Central Administration & Content Governance</p>
        </div>

        {serverError && (
          <div className="error-box admin-alert" role="alert">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="input-with-icon">
              <i className="fa-solid fa-user-shield input-icon"></i>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@bookloop.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-with-icon">
              <i className="fa-solid fa-key input-icon"></i>
              <input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="admin-demo-box">
            <small>
              <i className="fa-solid fa-info-circle"></i> Seeded Admin: <strong>admin@bookloop.com</strong> / <strong>Admin@123</strong>
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              'Enter Admin Dashboard'
            )}
          </button>
        </form>

        <div className="admin-card-footer">
          <Link to="/login">
            <i className="fa-solid fa-arrow-left"></i> Return to Regular Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
