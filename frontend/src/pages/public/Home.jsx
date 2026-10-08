import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import BookCard from '../../components/BookCard';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, showFlash } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    document.title = 'BookLoop | Smart Book Lending & Exchange Platform';
    fetchFeaturedBooks();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchFeaturedBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/books/featured');
      setFeaturedBooks(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load featured books right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlistIds(new Set(res.data.map((item) => item.book_id)));
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const handleWishlistToggle = async (bookId) => {
    if (!isAuthenticated) {
      showFlash('Please log in to save books to your wishlist.', 'info');
      return;
    }

    const isSaved = wishlistIds.has(bookId);
    try {
      if (isSaved) {
        await api.delete(`/wishlist/${bookId}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        showFlash('Book removed from wishlist.', 'info');
      } else {
        await api.post(`/wishlist/${bookId}`);
        setWishlistIds((prev) => new Set([...prev, bookId]));
        showFlash('Book added to wishlist!', 'success');
      }
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to update wishlist', 'error');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-graduation-cap"></i> Campus Book Lending & Exchange
          </div>
          <h1 className="hero-title">
            Pass the Book, <br />
            <span className="text-highlight">Keep Knowledge Moving</span>
          </h1>
          <p className="hero-subtitle">
            BookLoop connects students and book enthusiasts to lend, borrow, and exchange books effortlessly.
            Get 3 complimentary credits upon sign up, request books, and build your trusted peer reputation.
          </p>

          <div className="hero-actions">
            <Link to="/browse" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-compass"></i> Explore Books
            </Link>
            {isAuthenticated ? (
              <Link to="/add-book" className="btn btn-accent btn-lg">
                <i className="fa-solid fa-plus-circle"></i> List a Book
              </Link>
            ) : (
              <Link to="/register" className="btn btn-accent btn-lg">
                <i className="fa-solid fa-user-plus"></i> Join with 3 Free Credits
              </Link>
            )}
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">3 Credits</span>
              <span className="stat-label">On Sign Up</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">14 Days</span>
              <span className="stat-label">Standard Loan Period</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">Trusted</span>
              <span className="stat-label">Peer-Rated Profiles</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-tag">Simple & Transparent</span>
          <h2 className="section-title">How BookLoop Works</h2>
          <p className="section-desc">Borrow or swap your favorite books in three easy steps.</p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-card">
            <div className="step-badge">1</div>
            <div className="step-icon-wrap">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3 className="step-title">Discover & Request</h3>
            <p className="step-desc">
              Browse books listed by campus peers. When you find a book you like, submit a request using your available credits.
            </p>
          </div>

          <div className="step-card">
            <div className="step-badge">2</div>
            <div className="step-icon-wrap">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <h3 className="step-title">Accept & Read</h3>
            <p className="step-desc">
              The owner accepts your request. You get 14 days to enjoy the book while dates and status are tracked automatically.
            </p>
          </div>

          <div className="step-card">
            <div className="step-badge">3</div>
            <div className="step-icon-wrap">
              <i className="fa-solid fa-star"></i>
            </div>
            <h3 className="step-title">Return & Rate</h3>
            <p className="step-desc">
              Return the book to its owner. The lender earns back a credit, and both participants can rate each other to earn the Trusted badge.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-section">
        <div className="section-header-split">
          <div>
            <span className="section-tag">Curated Collection</span>
            <h2 className="section-title">Featured Books Available Now</h2>
          </div>
          <Link to="/browse" className="btn btn-outline">
            View All Books <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <Loader message="Fetching featured titles..." />
        ) : error ? (
          <div className="error-box">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchFeaturedBooks}>
              <i className="fa-solid fa-rotate"></i> Retry
            </button>
          </div>
        ) : featuredBooks.length === 0 ? (
          <div className="empty-state-box">
            <i className="fa-solid fa-book-open empty-icon"></i>
            <h3>No books available yet</h3>
            <p>Be the first member to list a book and share with the community!</p>
            <Link to="/add-book" className="btn btn-primary">
              Add a Book
            </Link>
          </div>
        ) : (
          <div className="book-grid">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isWishlisted={wishlistIds.has(book.id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Exchange & Lending Explanation Banner */}
      <section className="exchange-info-banner">
        <div className="exchange-banner-card">
          <div className="exchange-icon">
            <i className="fa-solid fa-arrow-right-arrow-left"></i>
          </div>
          <div className="exchange-text">
            <h3>Lend vs. Exchange Listings</h3>
            <p>
              <strong>Lend:</strong> Borrow a book for 14 days using 1 credit and return it to its owner.<br />
              <strong>Exchange:</strong> Swap or borrow using credits. Browse unique peer copies and expand your personal reading horizons!
            </p>
          </div>
          <Link to="/about" className="btn btn-outline-white">
            Learn More
          </Link>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to start reading and sharing?</h2>
          <p>Join fellow students on BookLoop. Free to sign up, instant 3 credits, zero hassle.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-accent btn-lg">
              Create Free Account <i className="fa-solid fa-arrow-right"></i>
            </Link>
            <Link to="/browse" className="btn btn-outline-white btn-lg">
              Explore Library
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
