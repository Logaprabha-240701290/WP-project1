import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const History = () => {
  const { user, showFlash, refreshUser } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Return modal state
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [selectedReqForReturn, setSelectedReqForReturn] = useState(null);
  const [returning, setReturning] = useState(false);

  // Rating modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedReqForRating, setSelectedReqForRating] = useState(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    document.title = 'Loan & Exchange History | BookLoop';
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/requests/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (req) => {
    setSelectedReqForReturn(req);
    setReturnConfirmOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedReqForReturn) return;
    setReturning(true);
    try {
      const res = await api.put(`/requests/${selectedReqForReturn.id}/return`);
      showFlash(res.data.message || 'Book marked as returned! 1 credit awarded.', 'success');
      await refreshUser();
      setReturnConfirmOpen(false);
      setSelectedReqForReturn(null);
      fetchHistory();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to mark book as returned.', 'error');
    } finally {
      setReturning(false);
    }
  };

  const handleOpenRatingModal = (req) => {
    setSelectedReqForRating(req);
    setScore(5);
    setComment('');
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedReqForRating) return;

    if (!score || score < 1 || score > 5) {
      showFlash('Please select a star rating between 1 and 5.', 'warning');
      return;
    }

    setSubmittingRating(true);
    try {
      await api.post('/ratings', {
        request_id: selectedReqForRating.id,
        score,
        comment: comment.trim() || undefined,
      });
      showFlash('Rating submitted! Thank you for supporting peer trust.', 'success');
      setRatingModalOpen(false);
      setSelectedReqForRating(null);
      fetchHistory();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to submit rating.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="history-page container">
      <Breadcrumb items={[{ label: 'Loan History' }]} />

      <div className="section-header-split">
        <div>
          <h1 className="page-title">Exchange & Loan History</h1>
          <p className="page-subtitle">Track return deadlines, return completed books, and review peer ratings.</p>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading exchange history..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchHistory}>
            Retry
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state-box">
          <i className="fa-solid fa-clock-rotate-left empty-icon"></i>
          <h3>No historical transactions found</h3>
          <p>Once you lend or borrow books, your complete lending ledger will be visible here.</p>
          <Link to="/browse" className="btn btn-primary">
            Explore Available Books
          </Link>
        </div>
      ) : (
        <div className="history-cards-list">
          {history.map((req) => {
            const isLender = req.book?.owner_id === user.id;
            const isBorrower = req.requester_id === user.id;
            const peer = isLender ? req.requester : req.owner;
            const userRatingGiven = req.ratings?.find((r) => r.from_user === user.id);

            return (
              <div
                key={req.id}
                className={`history-card status-border-${req.status} ${
                  req.is_overdue ? 'history-card-overdue' : ''
                }`}
              >
                <div className="history-card-header">
                  <div>
                    <div className="history-role-tag">
                      <span className={`role-pill ${isLender ? 'role-lender' : 'role-borrower'}`}>
                        {isLender ? 'You Lent This Book' : 'You Borrowed This Book'}
                      </span>
                      <span className="history-type-label">
                        {req.book?.type === 'exchange' ? 'Exchange' : 'Standard Lend'}
                      </span>
                    </div>

                    <h3 className="history-book-title">
                      <Link to={`/books/${req.book_id}`}>{req.book?.title}</Link>
                    </h3>
                    <p className="history-author">by {req.book?.author}</p>
                  </div>

                  <div className="history-status-block">
                    <span className={`status-badge status-${req.status}`}>
                      {req.status}
                    </span>
                    {req.is_overdue && (
                      <span className="badge-overdue">
                        <i className="fa-solid fa-triangle-exclamation"></i> Overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="history-grid-info">
                  <div className="history-peer-info">
                    <span className="history-label">Peer Member</span>
                    <div className="peer-row">
                      <div className="peer-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div>
                        <strong>{peer?.name || 'Campus Student'}</strong>
                        {peer?.area && <div className="peer-area">{peer.area}</div>}
                      </div>
                    </div>
                  </div>

                  <div className="history-dates-info">
                    <div className="date-item">
                      <span className="history-label">Request Date</span>
                      <span>{formatDate(req.request_date)}</span>
                    </div>
                    {req.due_date && (
                      <div className="date-item">
                        <span className="history-label">Due Date</span>
                        <span className={req.is_overdue ? 'text-danger font-bold' : ''}>
                          {formatDate(req.due_date)}
                        </span>
                      </div>
                    )}
                    {req.returned_date && (
                      <div className="date-item">
                        <span className="history-label">Returned On</span>
                        <span>{formatDate(req.returned_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating display if already rated */}
                {req.ratings && req.ratings.length > 0 && (
                  <div className="history-ratings-section">
                    <h4>Ratings for this exchange:</h4>
                    <div className="ratings-sublist">
                      {req.ratings.map((r) => (
                        <div key={r.id} className="rating-pill-display">
                          <StarRating score={r.score} size="sm" />
                          <span className="rating-comment-text">"{r.comment || 'Smooth exchange'}"</span>
                          <span className="rating-author-tag">— {r.from_user_name || 'Participant'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="history-actions-row">
                  {/* Mark as Returned: only owner can do this when accepted */}
                  {isLender && req.status === 'accepted' && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleOpenReturnModal(req)}
                    >
                      <i className="fa-solid fa-arrow-rotate-left"></i> Mark as Returned (+1 Credit)
                    </button>
                  )}

                  {/* Rate User button: when returned and user hasn't rated yet */}
                  {req.status === 'returned' && !userRatingGiven && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenRatingModal(req)}
                    >
                      <i className="fa-solid fa-star"></i> Rate Peer Member
                    </button>
                  )}

                  {req.status === 'returned' && userRatingGiven && (
                    <span className="rated-confirmation">
                      <i className="fa-solid fa-check"></i> You have rated this exchange
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Confirmation Modal */}
      <ConfirmDialog
        isOpen={returnConfirmOpen}
        title="Confirm Book Return"
        message={`Confirm that "${selectedReqForReturn?.book?.title}" has been handed back? 1 credit will be awarded to your account.`}
        confirmText="Confirm Return"
        cancelText="Cancel"
        danger={false}
        loading={returning}
        onConfirm={handleConfirmReturn}
        onCancel={() => {
          setReturnConfirmOpen(false);
          setSelectedReqForReturn(null);
        }}
      />

      {/* Rating Modal */}
      {ratingModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card modal-rating-card">
            <div className="modal-header">
              <div className="modal-icon-badge icon-star">
                <i className="fa-solid fa-star"></i>
              </div>
              <h3 className="modal-title">
                Rate Your Experience with {selectedReqForRating?.requester_id === user?.id
                  ? selectedReqForRating?.owner?.name
                  : selectedReqForRating?.requester?.name}
              </h3>
            </div>

            <form onSubmit={handleSubmitRating}>
              <div className="modal-body">
                <p className="rating-modal-desc">
                  How was the exchange for <strong>{selectedReqForRating?.book?.title}</strong>?
                  Your honest feedback helps build campus trust!
                </p>

                <div className="star-input-group">
                  <label>Rating (1 to 5 Stars) *</label>
                  <StarRating
                    score={score}
                    interactive={true}
                    onChange={(newScore) => setScore(newScore)}
                    size="lg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating-comment">Review Comment (Optional)</label>
                  <textarea
                    id="rating-comment"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Prompt handoff, book was cleanly maintained, great communicator!"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRatingModalOpen(false);
                    setSelectedReqForRating(null);
                  }}
                  disabled={submittingRating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingRating}
                >
                  {submittingRating ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    'Submit Rating'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
