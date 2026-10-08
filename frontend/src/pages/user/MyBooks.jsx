import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const MyBooks = () => {
  const { showFlash } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'My Listed Books | BookLoop';
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/books/mine');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your books.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelete = (book) => {
    if (book.status === 'borrowed') {
      showFlash('Cannot delete a book that is currently borrowed by a peer.', 'warning');
      return;
    }
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/books/${bookToDelete.id}`);
      showFlash(`"${bookToDelete.title}" has been removed from your listings.`, 'success');
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      setDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to delete book.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="my-books-page container">
      <Breadcrumb items={[{ label: 'My Listed Books' }]} />

      <div className="section-header-split">
        <div>
          <h1 className="page-title">My Book Listings</h1>
          <p className="page-subtitle">Manage, update, and track the status of books you've shared.</p>
        </div>
        <Link to="/add-book" className="btn btn-primary">
          <i className="fa-solid fa-plus-circle"></i> Add New Book
        </Link>
      </div>

      {loading ? (
        <Loader message="Loading your catalog..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchMyBooks}>
            Retry
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state-box">
          <i className="fa-solid fa-book empty-icon"></i>
          <h3>You haven't listed any books yet</h3>
          <p>Share textbooks, fiction, or guides with campus peers and start earning credits!</p>
          <Link to="/add-book" className="btn btn-primary btn-lg">
            <i className="fa-solid fa-plus-circle"></i> List Your First Book
          </Link>
        </div>
      ) : (
        <div className="table-responsive my-books-table-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Genre</th>
                <th>Type</th>
                <th>Status</th>
                <th>Loan Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className={b.is_overdue ? 'row-overdue' : ''}>
                  <td className="table-cover-cell">
                    {b.image_url ? (
                      <img src={getImageUrl(b.image_url)} alt={b.title} className="table-thumb" />
                    ) : (
                      <div className="table-thumb-placeholder">
                        <i className="fa-solid fa-book"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <Link to={`/books/${b.id}`} className="table-title-link">
                      <strong>{b.title}</strong>
                    </Link>
                    <div className="table-sub-text">by {b.author}</div>
                  </td>
                  <td>
                    <span className="badge-genre-table">{b.genre}</span>
                  </td>
                  <td>
                    <span className={`badge-type-table badge-type-${b.type}`}>
                      {b.type === 'exchange' ? 'Exchange' : 'Lend'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-inline status-${b.status}`}>
                      {b.status}
                    </span>
                    {b.is_overdue && (
                      <span className="badge-overdue-inline">Overdue</span>
                    )}
                  </td>
                  <td className="table-loan-info">
                    {b.status === 'borrowed' && b.borrower ? (
                      <div>
                        <div>
                          <i className="fa-solid fa-user"></i> {b.borrower.name}
                        </div>
                        {b.due_date && (
                          <div className={`due-date-text ${b.is_overdue ? 'text-danger' : ''}`}>
                            Due: {formatDate(b.due_date)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Not on loan</span>
                    )}
                  </td>
                  <td className="table-actions-cell">
                    <div className="action-buttons-group">
                      <Link
                        to={`/edit-book/${b.id}`}
                        className="btn btn-outline btn-sm"
                        title="Edit Book Details"
                      >
                        <i className="fa-solid fa-pen"></i> Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDelete(b)}
                        disabled={b.status === 'borrowed'}
                        title={
                          b.status === 'borrowed'
                            ? 'Cannot delete a borrowed book'
                            : 'Delete this listing'
                        }
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Book Listing"
        message={`Are you sure you want to delete "${bookToDelete?.title}"? This listing will be permanently removed.`}
        confirmText="Yes, Delete Listing"
        cancelText="Cancel"
        danger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBookToDelete(null);
        }}
      />
    </div>
  );
};

export default MyBooks;
