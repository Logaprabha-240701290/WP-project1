import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import BookCard from '../../components/BookCard';
import Breadcrumb from '../../components/Breadcrumb';
import Pagination from '../../components/Pagination';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const GENRES = [
  'All Genres',
  'Technology',
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mystery',
  'Fantasy',
  'Biography',
  'Economics',
  'Self-Help'
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, showFlash } = useAuth();

  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All Genres');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    document.title = 'Browse Books | BookLoop';
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlistIds(new Set(res.data.map((item) => item.book_id)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = {
      page,
      per_page: 9,
    };
    if (search.trim()) params.search = search.trim();
    if (selectedGenre && selectedGenre !== 'All Genres') params.genre = selectedGenre;
    if (selectedType && selectedType !== 'all') params.type = selectedType;
    if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

    try {
      const res = await api.get('/books', { params });
      setBooks(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setTotalBooks(res.data.total || 0);

      // Update URL query parameters
      const urlParams = {};
      if (search.trim()) urlParams.search = search.trim();
      if (selectedGenre && selectedGenre !== 'All Genres') urlParams.genre = selectedGenre;
      if (selectedType && selectedType !== 'all') urlParams.type = selectedType;
      if (selectedStatus && selectedStatus !== 'all') urlParams.status = selectedStatus;
      if (page > 1) urlParams.page = page;
      setSearchParams(urlParams, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedGenre, selectedType, selectedStatus, setSearchParams]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All Genres');
    setSelectedType('all');
    setSelectedStatus('all');
    setPage(1);
    setSearchParams({}, { replace: true });
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
    <div className="browse-page container">
      <Breadcrumb items={[{ label: 'Browse Library' }]} />

      <div className="browse-header-bar">
        <div>
          <h1 className="page-title">Browse Library</h1>
          <p className="page-subtitle">Discover books shared by your campus peers and community.</p>
        </div>
        <div className="browse-count-tag">
          <i className="fa-solid fa-book"></i> {totalBooks} {totalBooks === 1 ? 'Book' : 'Books'} Found
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="filter-panel">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-group">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search input"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="filter-controls-row">
          <div className="filter-control">
            <label htmlFor="filter-genre">
              <i className="fa-solid fa-shapes"></i> Genre
            </label>
            <select
              id="filter-genre"
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="filter-type">
              <i className="fa-solid fa-right-left"></i> Type
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              <option value="all">All Types</option>
              <option value="lend">Lend (Borrow)</option>
              <option value="exchange">Exchange (Swap)</option>
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="filter-status">
              <i className="fa-solid fa-circle-check"></i> Availability
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="form-select"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="borrowed">Currently Borrowed</option>
              <option value="requested">Requested</option>
            </select>
          </div>

          <div className="filter-control reset-control">
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-outline btn-reset"
              title="Reset all search filters"
            >
              <i className="fa-solid fa-arrow-rotate-left"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Loader message="Loading books matching your criteria..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchBooks}>
            <i className="fa-solid fa-rotate"></i> Retry
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state-box">
          <i className="fa-solid fa-magnifying-glass empty-icon"></i>
          <h3>No matching books found</h3>
          <p>Try modifying your search keywords or loosening the genre and availability filters.</p>
          <button className="btn btn-outline" onClick={handleResetFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isWishlisted={wishlistIds.has(book.id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>

          <div className="pagination-wrapper">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Browse;
