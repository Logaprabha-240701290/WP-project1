import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { getGenreColor } from '../utils/helpers';
import { getImageUrl } from '../api/axios';

const BookCard = ({ book, onWishlistToggle, isWishlisted = false, showOwner = true }) => {
  const [imgError, setImgError] = useState(false);

  if (!book) return null;

  const genreBg = getGenreColor(book.genre);

  return (
    <div className={`book-card ${book.is_overdue ? 'card-overdue' : ''}`}>
      <div className="book-card-cover-container">
        {book.image_url && !imgError ? (
          <img
            src={getImageUrl(book.image_url)}
            alt={book.title}
            className="book-card-cover-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="book-card-placeholder-cover" style={{ borderTopColor: genreBg }}>
            <div className="placeholder-icon">
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="placeholder-title">{book.title}</div>
            <div className="placeholder-author">by {book.author}</div>
          </div>
        )}

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className={`badge-type badge-type-${book.type}`}>
            {book.type === 'exchange' ? (
              <>
                <i className="fa-solid fa-arrow-right-arrow-left"></i> Exchange
              </>
            ) : (
              <>
                <i className="fa-solid fa-hand-holding-heart"></i> Lend
              </>
            )}
          </span>

          {book.is_overdue && (
            <span className="badge-status badge-overdue">
              <i className="fa-solid fa-clock"></i> Overdue
            </span>
          )}
        </div>

        {/* Wishlist toggle button */}
        {onWishlistToggle && (
          <button
            type="button"
            className={`btn-wishlist-toggle ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(book.id);
            }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Toggle Wishlist"
          >
            <i className={`fa-${isWishlisted ? 'solid' : 'regular'} fa-heart`}></i>
          </button>
        )}
      </div>

      <div className="book-card-body">
        <div className="book-meta-tags">
          <span className="badge-genre" style={{ backgroundColor: `${genreBg}15`, color: genreBg }}>
            {book.genre}
          </span>
          <span className="badge-condition">
            <i className="fa-solid fa-shield-heart"></i> {book.condition}
          </span>
        </div>

        <h3 className="book-card-title">
          <Link to={`/books/${book.id}`} title={book.title}>
            {book.title}
          </Link>
        </h3>
        <p className="book-card-author">by {book.author}</p>

        {showOwner && book.owner && (
          <div className="book-card-owner">
            <div className="owner-info">
              <div className="owner-avatar">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="owner-details">
                <div className="owner-name-row">
                  <span className="owner-name">{book.owner.name}</span>
                  {book.owner.is_trusted && (
                    <span className="badge-trusted" title="Trusted User (Avg rating >= 4 with 3+ reviews)">
                      <i className="fa-solid fa-circle-check"></i> Trusted
                    </span>
                  )}
                </div>
                {book.owner.area && (
                  <span className="owner-area">
                    <i className="fa-solid fa-location-dot"></i> {book.owner.area}
                  </span>
                )}
              </div>
            </div>

            <div className="owner-rating-row">
              <StarRating
                score={book.owner.avg_rating}
                showScore={true}
                ratingCount={book.owner.rating_count}
                size="sm"
              />
            </div>
          </div>
        )}

        <div className="book-card-footer">
          <div className="book-status-pill">
            <span className={`status-dot status-${book.status}`}></span>
            <span className="status-label">
              {book.status === 'available'
                ? 'Available'
                : book.status === 'borrowed'
                ? 'Borrowed'
                : 'Requested'}
            </span>
          </div>
          <Link to={`/books/${book.id}`} className="btn btn-outline btn-sm">
            View Details <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
