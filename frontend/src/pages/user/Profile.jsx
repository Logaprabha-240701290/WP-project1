import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { isValidPhone, isValidPassword } from '../../utils/validators';

const Profile = () => {
  const { user, refreshUser, showFlash } = useAuth();

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    area: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    document.title = 'My Profile | BookLoop';
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        area: user.area || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profileData.name.trim()) errs.name = 'Full name is required';
    if (profileData.phone && !isValidPhone(profileData.phone)) {
      errs.phone = 'Please provide a valid phone number (10-12 digits)';
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    setSavingProfile(true);
    try {
      await api.put('/profile', profileData);
      await refreshUser();
      showFlash('Profile information updated successfully!', 'success');
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordData.current_password) {
      errs.current_password = 'Enter your current password';
    }
    if (!passwordData.new_password) {
      errs.new_password = 'Enter a new password';
    } else if (!isValidPassword(passwordData.new_password)) {
      errs.new_password = 'Password must be at least 8 characters long';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errs.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/profile/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      showFlash('Password changed successfully! Keep it secure.', 'success');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return <Loader message="Loading profile..." fullScreen />;
  }

  return (
    <div className="profile-page container">
      <Breadcrumb items={[{ label: 'Member Profile' }]} />

      <div className="profile-layout-grid">
        {/* Profile Card / Overview */}
        <div className="profile-overview-col">
          <div className="profile-badge-card">
            <div className="profile-avatar-wrap">
              <i className="fa-solid fa-user"></i>
            </div>

            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>

            {user.is_trusted && (
              <div className="trusted-banner-large" title="Maintains an average rating >= 4 with at least 3 reviews">
                <i className="fa-solid fa-certificate"></i>
                <span>Verified Trusted Peer</span>
              </div>
            )}

            <div className="profile-stats-list">
              <div className="p-stat-item">
                <div className="p-stat-icon">
                  <i className="fa-solid fa-coins"></i>
                </div>
                <div className="p-stat-details">
                  <span className="p-stat-value">{user.credits}</span>
                  <span className="p-stat-label">Book Credits</span>
                </div>
              </div>

              <div className="p-stat-item">
                <div className="p-stat-icon">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="p-stat-details">
                  <span className="p-stat-value">
                    {user.avg_rating > 0 ? user.avg_rating : 'New'}
                  </span>
                  <span className="p-stat-label">
                    Average Rating ({user.rating_count} reviews)
                  </span>
                </div>
              </div>

              <div className="p-stat-item">
                <div className="p-stat-icon">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="p-stat-details">
                  <span className="p-stat-value">{user.area || 'Not specified'}</span>
                  <span className="p-stat-label">Campus Area</span>
                </div>
              </div>
            </div>

            <div className="trusted-criteria-box">
              <h4>Trusted Badge Criteria:</h4>
              <p>
                Maintain an average rating of 4.0 or above with a minimum of 3 ratings from fellow student exchanges.
              </p>
            </div>
          </div>
        </div>

        {/* Edit Forms Column */}
        <div className="profile-forms-col">
          {/* Edit Information Form */}
          <div className="profile-form-card">
            <div className="form-card-header">
              <h3>
                <i className="fa-solid fa-id-card"></i> Personal Information
              </h3>
              <p>Update your display name, contact phone, and campus pickup area.</p>
            </div>

            <form onSubmit={handleUpdateProfile} noValidate>
              <div className="form-group">
                <label htmlFor="prof-name">Full Name *</label>
                <input
                  id="prof-name"
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className={`form-input ${profileErrors.name ? 'input-error' : ''}`}
                />
                {profileErrors.name && (
                  <span className="field-error">{profileErrors.name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="prof-phone">Contact Phone</label>
                  <input
                    id="prof-phone"
                    type="tel"
                    name="phone"
                    placeholder="e.g. 9811122233"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className={`form-input ${profileErrors.phone ? 'input-error' : ''}`}
                  />
                  {profileErrors.phone && (
                    <span className="field-error">{profileErrors.phone}</span>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="prof-area">Campus Location / Dorm</label>
                  <input
                    id="prof-area"
                    type="text"
                    name="area"
                    placeholder="e.g. North Block, Room 302"
                    value={profileData.area}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="profile-form-card">
            <div className="form-card-header">
              <h3>
                <i className="fa-solid fa-shield-halved"></i> Change Password
              </h3>
              <p>Ensure your account remains safe using a strong password.</p>
            </div>

            <form onSubmit={handleUpdatePassword} noValidate>
              <div className="form-group">
                <label htmlFor="current-pw">Current Password *</label>
                <input
                  id="current-pw"
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className={`form-input ${
                    passwordErrors.current_password ? 'input-error' : ''
                  }`}
                />
                {passwordErrors.current_password && (
                  <span className="field-error">{passwordErrors.current_password}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group form-col">
                  <label htmlFor="new-pw">New Password (min 8 chars) *</label>
                  <input
                    id="new-pw"
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className={`form-input ${passwordErrors.new_password ? 'input-error' : ''}`}
                  />
                  {passwordErrors.new_password && (
                    <span className="field-error">{passwordErrors.new_password}</span>
                  )}
                </div>

                <div className="form-group form-col">
                  <label htmlFor="confirm-new-pw">Confirm New Password *</label>
                  <input
                    id="confirm-new-pw"
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className={`form-input ${
                      passwordErrors.confirm_password ? 'input-error' : ''
                    }`}
                  />
                  {passwordErrors.confirm_password && (
                    <span className="field-error">{passwordErrors.confirm_password}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-outline"
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
