import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import StarRating from '../../components/StarRating';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { getGenreColor, formatDate } from '../../utils/helpers';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, refreshUser, showFlash } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    if (isAuthenticated) {
      checkWishlistAndRequests();
    }
  }, [id, isAuthenticated]);

  const fetchBookDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data);
      document.title = `${res.data.title} | BookLoop`;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Book not found.');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistAndRequests = async () => {
    try {
      const [wRes, rRes] = await Promise.all([
        api.get('/wishlist'),
        api.get('/requests/sent'),
      ]);
      const bookIdInt = parseInt(id, 10);
      setIsWishlisted(wRes.data.some((item) => item.book_id === bookIdInt));
      setHasPendingRequest(
        rRes.data.some(
          (req) => req.book_id === bookIdInt && (req.status === 'pending' || req.status === 'accepted')
        )
      );
    } catch (err) {
      console.error('Error fetching user context for book:', err);
    }
  };

  const handleRequestBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (user?.credits <= 0) {
      showFlash('You need at least 1 credit to request a book. Return a book to earn credits!', 'warning');
      return;
    }

    setRequesting(true);
    try {
      await api.post('/requests', { book_id: book.id });
      showFlash('Request submitted successfully! The owner will be notified.', 'success');
      setHasPendingRequest(true);
      await refreshUser();
      // Re-fetch book details
      fetchBookDetails();
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to submit request.', 'error');
    } finally {
      setRequesting(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${book.id}`);
        setIsWishlisted(false);
        showFlash('Book removed from your wishlist.', 'info');
      } else {
        await api.post(`/wishlist/${book.id}`);
        setIsWishlisted(true);
        showFlash('Book saved to your wishlist!', 'success');
      }
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to update wishlist.', 'error');
    }
  };

  if (loading) {
    return <Loader message="Loading book details..." fullScreen />;
  }

  if (error || !book) {
    return (
      <div className="container details-error-container">
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <h3>Book Unavailable</h3>
          <p>{error || 'The book you are looking for could not be found.'}</p>
          <Link to="/browse" className="btn btn-primary">
            <i className="fa-solid fa-arrow-left"></i> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === book.owner_id;
  const genreColor = getGenreColor(book.genre);

  return (
    <div className="book-details-page container">
      <Breadcrumb
        items={[
          { label: 'Browse', link: '/browse' },
          { label: book.title },
        ]}
      />

      <div className="details-card-wrapper">
        <div className="details-grid">
          {/* Left Column: Book Cover Presentation */}
          <div className="details-cover-col">
            <div className="details-image-frame">
              {book.image_url && !imgError ? (
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="details-img"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="details-placeholder-cover" style={{ borderTopColor: genreColor }}>
                  <i className="fa-solid fa-book-open placeholder-large-icon"></i>
                  <h3 className="placeholder-large-title">{book.title}</h3>
                  <p className="placeholder-large-author">by {book.author}</p>
                  <span className="placeholder-badge">{book.genre}</span>
                </div>
              )}

              {/* Status Ribbon */}
              <div className="details-status-tag">
                <span className={`status-dot status-${book.status}`}></span>
                <span className="details-status-text">
                  {book.status === 'available'
                    ? 'Available for Request'
                    : book.status === 'borrowed'
                    ? 'Currently Borrowed'
                    : 'Request Pending'}
                </span>
              </div>
            </div>

            {/* Overdue Warning Callout */}
            {book.is_overdue && (
              <div className="overdue-alert-box">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <div>
                  <strong>Overdue Notice:</strong> This loan has exceeded its 14-day due date.
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Book Metadata & Actions */}
          <div className="details-info-col">
            <div className="details-header">
              <div className="details-badge-row">
                <span
                  className="badge-genre-pill"
                  style={{ backgroundColor: `${genreColor}15`, color: genreColor }}
                >
                  <i className="fa-solid fa-bookmark"></i> {book.genre}
                </span>

                <span className={`badge-type-pill badge-type-${book.type}`}>
                  {book.type === 'exchange' ? (
                    <>
                      <i className="fa-solid fa-arrow-right-arrow-left"></i> Exchange Listing
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-hand-holding-heart"></i> Lend Listing
                    </>
                  )}
                </span>

                <span className="badge-condition-pill">
                  <i className="fa-solid fa-sparkles"></i> Condition: {book.condition}
                </span>
              </div>

              <h1 className="details-title">{book.title}</h1>
              <p className="details-author">
                By <span className="author-name">{book.author}</span>
              </p>
            </div>

            {/* Exchange note if exchange */}
            {book.type === 'exchange' && (
              <div className="exchange-callout">
                <i className="fa-solid fa-circle-info"></i>
                <span>
                  <strong>Exchange Listing:</strong> Swap or borrow using credits.
                </span>
              </div>
            )}

            {/* Description Section */}
            <div className="details-description-box">
              <h3>Description</h3>
              <p>{book.description || 'No detailed description provided by the owner.'}</p>
            </div>

            {/* Owner Profile Card */}
            {book.owner && (
              <div className="owner-card">
                <div className="owner-card-avatar">
                  <i className="fa-solid fa-user-circle"></i>
                </div>
                <div className="owner-card-content">
                  <div className="owner-name-line">
                    <span className="owner-fullname">{book.owner.name}</span>
                    {book.owner.is_trusted && (
                      <span className="badge-trusted" title="Trusted Peer (Average rating >= 4 with 3+ reviews)">
                        <i className="fa-solid fa-circle-check"></i> Trusted Peer
                      </span>
                    )}
                  </div>
                  {book.owner.area && (
                    <div className="owner-meta-line">
                      <i className="fa-solid fa-location-dot"></i> {book.owner.area}
                    </div>
                  )}
                  <div className="owner-meta-rating">
                    <StarRating
                      score={book.owner.avg_rating}
                      showScore={true}
                      ratingCount={book.owner.rating_count}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="details-action-bar">
              {isOwner ? (
                <div className="owner-action-group">
                  <span className="owner-indicator">
                    <i className="fa-solid fa-check-circle"></i> You are the owner of this listing
                  </span>
                  <Link to={`/edit-book/${book.id}`} className="btn btn-primary">
                    <i className="fa-solid fa-pen-to-square"></i> Edit Book
                  </Link>
                  <Link to="/my-books" className="btn btn-outline">
                    View in My Books
                  </Link>
                </div>
              ) : (
                <div className="borrower-action-group">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg btn-request-action"
                    onClick={handleRequestBook}
                    disabled={
                      requesting ||
                      hasPendingRequest ||
                      book.status === 'borrowed' ||
                      (isAuthenticated && user?.credits <= 0)
                    }
                  >
                    {requesting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Submitting Request...
                      </>
                    ) : hasPendingRequest ? (
                      <>
                        <i className="fa-solid fa-clock-rotate-left"></i> Request Pending
                      </>
                    ) : book.status === 'borrowed' ? (
                      <>
                        <i className="fa-solid fa-lock"></i> Currently Borrowed
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-handshake"></i> Request This Book
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`btn btn-outline btn-lg btn-wishlist-action ${
                      isWishlisted ? 'active-wishlist' : ''
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`}></i>
                    {isWishlisted ? ' In Wishlist' : ' Add to Wishlist'}
                  </button>
                </div>
              )}

              {/* Credit warning for logged in non-owners */}
              {!isOwner && isAuthenticated && user?.credits <= 0 && (
                <p className="credit-zero-warning">
                  <i className="fa-solid fa-circle-exclamation"></i> You currently have 0 credits.
                  Return books to earn credits or contact support.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
