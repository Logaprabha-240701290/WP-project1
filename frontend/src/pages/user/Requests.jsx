import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const Requests = () => {
  const { showFlash, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Exchange Requests | BookLoop';
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recvRes, sentRes] = await Promise.all([
        api.get('/requests/received'),
        api.get('/requests/sent'),
      ]);
      setReceivedRequests(recvRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/accept`);
      showFlash(res.data.message || 'Request accepted successfully!', 'success');
      await refreshUser();
      fetchRequests();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to accept request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/reject`);
      showFlash(res.data.message || 'Request rejected.', 'info');
      fetchRequests();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to reject request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (requestId) => {
    setActionLoadingId(requestId);
    try {
      const res = await api.put(`/requests/${requestId}/cancel`);
      showFlash(res.data.message || 'Request cancelled.', 'info');
      fetchRequests();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to cancel request.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'pending').length;
  const pendingSentCount = sentRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="requests-page container">
      <Breadcrumb items={[{ label: 'Exchange Requests' }]} />

      <div className="section-header-split">
        <div>
          <h1 className="page-title">Exchange & Loan Requests</h1>
          <p className="page-subtitle">Review incoming peer requests or track books you've requested.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="custom-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <i className="fa-solid fa-inbox"></i> Received Requests
          {pendingReceivedCount > 0 && (
            <span className="tab-badge">{pendingReceivedCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <i className="fa-solid fa-paper-plane"></i> Sent Requests
          {pendingSentCount > 0 && (
            <span className="tab-badge">{pendingSentCount}</span>
          )}
        </button>
      </div>

      {loading ? (
        <Loader message="Loading requests..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchRequests}>
            Retry
          </button>
        </div>
      ) : activeTab === 'received' ? (
        /* RECEIVED REQUESTS TAB */
        receivedRequests.length === 0 ? (
          <div className="empty-state-box">
            <i className="fa-solid fa-envelope-open-text empty-icon"></i>
            <h3>No requests received yet</h3>
            <p>When other students request your books, they will appear here for you to accept.</p>
            <Link to="/my-books" className="btn btn-outline">
              Check Your Listed Books
            </Link>
          </div>
        ) : (
          <div className="requests-list">
            {receivedRequests.map((req) => (
              <div key={req.id} className={`request-card status-border-${req.status}`}>
                <div className="request-card-header">
                  <div className="request-book-info">
                    <span className="request-badge-type">
                      {req.book?.type === 'exchange' ? 'Exchange Request' : 'Lend Request'}
                    </span>
                    <h3 className="request-book-title">
                      <Link to={`/books/${req.book_id}`}>{req.book?.title}</Link>
                    </h3>
                    <div className="request-date-line">
                      <i className="fa-regular fa-clock"></i> Requested on {formatDate(req.request_date)}
                    </div>
                  </div>

                  <div className="request-status-wrap">
                    <span className={`status-badge status-${req.status}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="request-card-body">
                  <div className="requester-profile-box">
                    <div className="requester-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="requester-details">
                      <div className="requester-name-row">
                        <span className="requester-name">{req.requester?.name}</span>
                        {req.requester?.is_trusted && (
                          <span className="badge-trusted">
                            <i className="fa-solid fa-circle-check"></i> Trusted User
                          </span>
                        )}
                      </div>
                      {req.requester?.area && (
                        <div className="requester-area">
                          <i className="fa-solid fa-location-dot"></i> {req.requester?.area}
                        </div>
                      )}
                      <StarRating
                        score={req.requester?.avg_rating}
                        showScore={true}
                        ratingCount={req.requester?.rating_count}
                        size="sm"
                      />
                    </div>
                  </div>

                  {req.due_date && req.status === 'accepted' && (
                    <div className="request-due-notice">
                      <i className="fa-solid fa-calendar-check"></i>
                      <span>Due Date: <strong>{formatDate(req.due_date)}</strong></span>
                      {req.is_overdue && <span className="badge-overdue-inline">Overdue</span>}
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="request-card-footer">
                    <span className="accept-credit-note">
                      <i className="fa-solid fa-circle-info"></i> Accepting deducts 1 credit from borrower and loans for 14 days.
                    </span>
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoadingId === req.id}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAccept(req.id)}
                        disabled={actionLoadingId === req.id}
                      >
                        {actionLoadingId === req.id ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-check"></i> Accept Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* SENT REQUESTS TAB */
        sentRequests.length === 0 ? (
          <div className="empty-state-box">
            <i className="fa-solid fa-paper-plane empty-icon"></i>
            <h3>You haven't requested any books</h3>
            <p>Explore our library catalog to discover interesting titles from campus peers.</p>
            <Link to="/browse" className="btn btn-primary">
              Browse Books Now
            </Link>
          </div>
        ) : (
          <div className="requests-list">
            {sentRequests.map((req) => (
              <div key={req.id} className={`request-card status-border-${req.status}`}>
                <div className="request-card-header">
                  <div className="request-book-info">
                    <span className="request-badge-type">
                      {req.book?.type === 'exchange' ? 'Exchange Request' : 'Lend Request'}
                    </span>
                    <h3 className="request-book-title">
                      <Link to={`/books/${req.book_id}`}>{req.book?.title}</Link>
                    </h3>
                    <div className="request-date-line">
                      <i className="fa-regular fa-clock"></i> Sent on {formatDate(req.request_date)}
                    </div>
                  </div>

                  <div className="request-status-wrap">
                    <span className={`status-badge status-${req.status}`}>
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="request-card-body">
                  <div className="requester-profile-box">
                    <div className="requester-avatar">
                      <i className="fa-solid fa-book"></i>
                    </div>
                    <div className="requester-details">
                      <div className="requester-name-row">
                        <span className="requester-name">Owner: {req.owner?.name}</span>
                        {req.owner?.is_trusted && (
                          <span className="badge-trusted">
                            <i className="fa-solid fa-circle-check"></i> Trusted
                          </span>
                        )}
                      </div>
                      {req.owner?.area && (
                        <div className="requester-area">
                          <i className="fa-solid fa-location-dot"></i> {req.owner?.area}
                        </div>
                      )}
                      <StarRating
                        score={req.owner?.avg_rating}
                        showScore={true}
                        ratingCount={req.owner?.rating_count}
                        size="sm"
                      />
                    </div>
                  </div>

                  {req.due_date && req.status === 'accepted' && (
                    <div className="request-due-notice">
                      <i className="fa-solid fa-calendar-check"></i>
                      <span>Due Date: <strong>{formatDate(req.due_date)}</strong></span>
                      {req.is_overdue && (
                        <span className="badge-overdue-inline">Overdue Loan</span>
                      )}
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="request-card-footer">
                    <span className="text-muted text-sm">Waiting for owner approval...</span>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleCancel(req.id)}
                      disabled={actionLoadingId === req.id}
                    >
                      {actionLoadingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Requests;
