import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPassword, isValidPhone } from '../../utils/validators';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    area: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create Account | BookLoop';
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        area: formData.area.trim() || undefined,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error || 'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon-circle credit-celebration">
            <i className="fa-solid fa-coins"></i>
          </div>
          <h1 className="auth-title">Join BookLoop</h1>
          <p className="auth-subtitle">
            Sign up today and instantly receive <strong>3 free book credits</strong> to start borrowing!
          </p>
        </div>

        {serverError && (
          <div className="error-box auth-alert" role="alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="reg-name">Full Name *</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group form-col">
              <label htmlFor="reg-email">College / Personal Email *</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="reg-password">Password (min 8 chars) *</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                />
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group form-col">
              <label htmlFor="reg-confirm-password">Confirm Password *</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock-check input-icon"></i>
                <input
                  id="reg-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="reg-phone">Phone Number (10 Digits)</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-phone input-icon"></i>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9811122233"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group form-col">
              <label htmlFor="reg-area">Campus Area / Hostel</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-location-dot input-icon"></i>
                <input
                  id="reg-area"
                  type="text"
                  name="area"
                  placeholder="e.g. North Block, Hostel 4"
                  value={formData.area}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="signup-perk-badge">
            <i className="fa-solid fa-circle-check"></i>
            <span>3 Free Lending Credits will be credited to your account upon registration.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
