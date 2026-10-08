import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import BookCard from '../../components/BookCard';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const Wishlist = () => {
  const { showFlash } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Saved Wishlist | BookLoop';
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/wishlist');
      setWishlistItems(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your saved wishlist items.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      await api.delete(`/wishlist/${bookId}`);
      setWishlistItems((prev) => prev.filter((item) => item.book_id !== bookId));
      showFlash('Book removed from your wishlist.', 'info');
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to remove from wishlist.', 'error');
    }
  };

  return (
    <div className="wishlist-page container">
      <Breadcrumb items={[{ label: 'Saved Wishlist' }]} />

      <div className="section-header-split">
        <div>
          <h1 className="page-title">My Reading Wishlist</h1>
          <p className="page-subtitle">Books you've saved for future loans and exchanges.</p>
        </div>
        <div className="wishlist-count-badge">
          <i className="fa-solid fa-heart"></i> {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
        </div>
      </div>

      {loading ? (
        <Loader message="Loading your saved wishlist..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchWishlist}>
            Retry
          </button>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="empty-state-box">
          <i className="fa-solid fa-heart-crack empty-icon"></i>
          <h3>Your wishlist is empty</h3>
          <p>Explore the campus catalog and click the heart icon on any book you'd like to read later.</p>
          <Link to="/browse" className="btn btn-primary btn-lg">
            <i className="fa-solid fa-compass"></i> Browse Books
          </Link>
        </div>
      ) : (
        <div className="book-grid">
          {wishlistItems.map((item) =>
            item.book ? (
              <BookCard
                key={item.id}
                book={item.book}
                isWishlisted={true}
                onWishlistToggle={() => handleRemoveFromWishlist(item.book_id)}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
