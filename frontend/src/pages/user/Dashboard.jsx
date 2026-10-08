import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import Breadcrumb from '../../components/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.title = 'Dashboard | BookLoop';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshUser();
      const [booksRes, sentRes, recvRes, histRes] = await Promise.all([
        api.get('/books/mine'),
        api.get('/requests/sent'),
        api.get('/requests/received'),
        api.get('/requests/history'),
      ]);
      setMyBooks(booksRes.data);
      setSentRequests(sentRes.data);
      setReceivedRequests(recvRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your dashboard..." fullScreen />;
  }

  // Calculate statistics
  const booksListedCount = myBooks.length;
  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'pending').length;
  const pendingSentCount = sentRequests.filter((r) => r.status === 'pending').length;
  const totalPending = pendingReceivedCount + pendingSentCount;

  // Active loans currently in progress (status == 'accepted')
  const activeBorrows = sentRequests.filter((r) => r.status === 'accepted');
  const activeLends = receivedRequests.filter((r) => r.status === 'accepted');
  const totalActiveLoans = activeBorrows.length + activeLends.length;

  // Overdue check
  const overdueBorrows = activeBorrows.filter((r) => r.is_overdue);
  const overdueLends = activeLends.filter((r) => r.is_overdue);
  const hasOverdue = overdueBorrows.length > 0 || overdueLends.length > 0;

  // Recent activity: pick top 5 most recent requests from history
  const recentActivity = history.slice(0, 5);

  return (
    <div className="dashboard-page container">
      <Breadcrumb items={[{ label: 'Member Dashboard' }]} />

      {/* Greeting Banner */}
      <div className="dashboard-header-banner">
        <div className="dashboard-welcome">
          <h1>Hello, {user?.name}!</h1>
          <p>
            Welcome to your BookLoop command center. Track your loans, monitor your credit balance,
            and review incoming campus exchange requests.
          </p>
        </div>
        <div className="dashboard-header-action">
          <Link to="/add-book" className="btn btn-accent btn-lg">
            <i className="fa-solid fa-plus-circle"></i> List a New Book
          </Link>
        </div>
      </div>

      {/* Overdue Warning Alert Banner */}
      {hasOverdue && (
        <div className="dashboard-overdue-alert" role="alert">
          <div className="overdue-alert-icon">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="overdue-alert-content">
            <h3>Action Required: Overdue Loan Detected</h3>
            <p>
              {overdueBorrows.length > 0
                ? `You have ${overdueBorrows.length} borrowed book(s) past the 14-day return period. Please coordinate with the lender to return the book promptly.`
                : `You have ${overdueLends.length} loaned book(s) that are past their due date. Once handed back, remember to mark them as returned.`}
            </p>
          </div>
          <Link to="/history" className="btn btn-danger btn-sm">
            View Overdue Details
          </Link>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card metric-credits">
          <div className="metric-icon">
            <i className="fa-solid fa-coins"></i>
          </div>
          <div className="metric-info">
            <span className="metric-number">{user?.credits}</span>
            <span className="metric-label">Available Credits</span>
          </div>
          <span className="metric-footnote">1 credit per borrow</span>
        </div>

        <div className="metric-card metric-loans">
          <div className="metric-icon">
            <i className="fa-solid fa-book-reader"></i>
          </div>
          <div className="metric-info">
            <span className="metric-number">{totalActiveLoans}</span>
            <span className="metric-label">Active Loans</span>
          </div>
          <span className="metric-footnote">
            {activeBorrows.length} borrowed &bull; {activeLends.length} lent
          </span>
        </div>

        <div className="metric-card metric-requests">
          <div className="metric-icon">
            <i className="fa-solid fa-bell"></i>
          </div>
          <div className="metric-info">
            <span className="metric-number">{totalPending}</span>
            <span className="metric-label">Pending Requests</span>
          </div>
          <span className="metric-footnote">
            <Link to="/requests">{pendingReceivedCount} to review</Link>
          </span>
        </div>

        <div className="metric-card metric-books">
          <div className="metric-icon">
            <i className="fa-solid fa-book-bookmark"></i>
          </div>
          <div className="metric-info">
            <span className="metric-number">{booksListedCount}</span>
            <span className="metric-label">Books Listed</span>
          </div>
          <span className="metric-footnote">
            <Link to="/my-books">Manage collection</Link>
          </span>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="dashboard-shortcuts-row">
        <Link to="/browse" className="shortcut-btn">
          <i className="fa-solid fa-compass"></i>
          <span>Browse Catalog</span>
        </Link>
        <Link to="/requests" className="shortcut-btn">
          <i className="fa-solid fa-bell"></i>
          <span>
            Incoming Requests {pendingReceivedCount > 0 && `(${pendingReceivedCount})`}
          </span>
        </Link>
        <Link to="/history" className="shortcut-btn">
          <i className="fa-solid fa-clock-rotate-left"></i>
          <span>Loan History</span>
        </Link>
        <Link to="/wishlist" className="shortcut-btn">
          <i className="fa-solid fa-heart"></i>
          <span>My Wishlist</span>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="dashboard-section-box">
        <div className="dashboard-section-header">
          <h3>
            <i className="fa-solid fa-timeline"></i> Recent Loan & Request Activity
          </h3>
          <Link to="/history" className="btn btn-outline btn-sm">
            View All History <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="empty-inline-state">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <p>No transactions or requests recorded yet. Start by browsing or listing a book!</p>
            <Link to="/browse" className="btn btn-primary btn-sm">
              Explore Available Books
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Role</th>
                  <th>Peer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((req) => {
                  const isRequester = req.requester_id === user.id;
                  const peerName = isRequester ? req.owner?.name : req.requester?.name;
                  return (
                    <tr key={req.id}>
                      <td>
                        <Link to={`/books/${req.book_id}`} className="table-link">
                          <strong>{req.book?.title}</strong>
                        </Link>
                      </td>
                      <td>
                        <span className={`role-pill ${isRequester ? 'role-borrower' : 'role-lender'}`}>
                          {isRequester ? 'Borrower' : 'Lender'}
                        </span>
                      </td>
                      <td>{peerName || 'Campus Peer'}</td>
                      <td>{formatDate(req.request_date)}</td>
                      <td>
                        <span className={`status-badge-inline status-${req.status}`}>
                          {req.status}
                        </span>
                        {req.is_overdue && (
                          <span className="badge-overdue-inline">Overdue</span>
                        )}
                      </td>
                      <td>
                        <Link to="/history" className="btn btn-outline btn-sm">
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
