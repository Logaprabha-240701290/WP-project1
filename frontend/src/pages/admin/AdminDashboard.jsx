import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Admin Dashboard | BookLoop';
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading administrator statistics..." fullScreen />;
  }

  return (
    <div className="admin-dashboard-page container">
      <div className="admin-header-row">
        <div>
          <span className="admin-portal-tag">
            <i className="fa-solid fa-shield-halved"></i> Governance Portal
          </span>
          <h1 className="page-title">Platform Operations Dashboard</h1>
          <p className="page-subtitle">
            System health, active circulation, and user community metrics across the campus network.
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin/users" className="btn btn-primary">
            <i className="fa-solid fa-users"></i> Manage Users
          </Link>
          <Link to="/admin/books" className="btn btn-outline">
            <i className="fa-solid fa-book"></i> Manage Books
          </Link>
        </div>
      </div>

      {error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchStats}>
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Overdue Warning Callout for Admin */}
          {stats?.overdue_loans > 0 && (
            <div className="admin-warning-banner">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Overdue Books Alert:</strong> There are currently{' '}
                <strong>{stats.overdue_loans}</strong> loan(s) past the 14-day return deadline.
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-users">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number">{stats?.total_users ?? 0}</span>
                <span className="stat-label">Registered Members</span>
              </div>
              <Link to="/admin/users" className="admin-stat-link">
                View All Users <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-books">
                <i className="fa-solid fa-book-bookmark"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number">{stats?.total_books ?? 0}</span>
                <span className="stat-label">Cataloged Books</span>
              </div>
              <Link to="/admin/books" className="admin-stat-link">
                Manage Books <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-loans">
                <i className="fa-solid fa-book-reader"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number">{stats?.active_loans ?? 0}</span>
                <span className="stat-label">Active Book Loans</span>
              </div>
              <span className="stat-note">14-day loan cycles</span>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-exchanges">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number">{stats?.completed_exchanges ?? 0}</span>
                <span className="stat-label">Completed Returns</span>
              </div>
              <span className="stat-note">Credits reimbursed</span>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-pending">
                <i className="fa-solid fa-hourglass-half"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number">{stats?.pending_requests ?? 0}</span>
                <span className="stat-label">Pending Requests</span>
              </div>
              <span className="stat-note">Awaiting owner response</span>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon icon-overdue">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="admin-stat-info">
                <span className="stat-number text-danger">{stats?.overdue_loans ?? 0}</span>
                <span className="stat-label">Overdue Books</span>
              </div>
              <span className="stat-note">Needs coordinator review</span>
            </div>
          </div>

          {/* Quick Management Section */}
          <div className="admin-management-shortcuts">
            <div className="shortcut-card">
              <div className="sc-icon">
                <i className="fa-solid fa-user-gear"></i>
              </div>
              <h3>Member Governance</h3>
              <p>
                Inspect student accounts, view live balances, and suspend or unblock accounts violating exchange policies.
              </p>
              <Link to="/admin/users" className="btn btn-primary btn-sm">
                Open User Manager
              </Link>
            </div>

            <div className="shortcut-card">
              <div className="sc-icon">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h3>Catalog Governance</h3>
              <p>
                Review all books published on campus, toggle listing availability, and prune inappropriate content.
              </p>
              <Link to="/admin/books" className="btn btn-primary btn-sm">
                Open Book Manager
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
