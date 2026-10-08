import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const ManageBooks = () => {
  const { showFlash } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manage Catalog | BookLoop Admin';
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (book) => {
    if (book.status === 'borrowed') {
      showFlash('Cannot toggle availability while a book is actively borrowed.', 'warning');
      return;
    }

    setActionLoadingId(book.id);
    try {
      const res = await api.put(`/admin/books/${book.id}/toggle-availability`);
      showFlash(res.data.message || 'Book status updated.', 'success');
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? res.data.book : b))
      );
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to update book availability.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDelete = (b) => {
    if (b.status === 'borrowed') {
      showFlash('Cannot delete a book that is currently borrowed.', 'error');
      return;
    }
    setBookToDelete(b);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/books/${bookToDelete.id}`);
      showFlash(res.data.message || 'Book deleted successfully.', 'success');
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      setDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to delete book.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      (b.owner && b.owner.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="manage-books-page container">
      <div className="section-header-split">
        <div>
          <h1 className="page-title">Catalog Inventory Management</h1>
          <p className="page-subtitle">
            Moderate listings, verify content appropriateness, and toggle campus availability.
          </p>
        </div>
        <div className="search-filter-inline">
          <input
            type="text"
            placeholder="Search by title, author, owner, genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Loading catalog inventory..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchBooks}>
            Retry
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Owner</th>
                <th>Genre</th>
                <th>Type</th>
                <th>Status</th>
                <th>Listed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((b) => (
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
                    <strong>{b.owner?.name || 'Unknown'}</strong>
                    {b.owner?.area && (
                      <div className="table-sub-text">{b.owner.area}</div>
                    )}
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
                  <td>{formatDate(b.created_at)}</td>
                  <td>
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          b.status === 'available' ? 'btn-outline-warning' : 'btn-outline-success'
                        }`}
                        onClick={() => handleToggleAvailability(b)}
                        disabled={actionLoadingId === b.id || b.status === 'borrowed'}
                        title={
                          b.status === 'borrowed'
                            ? 'Cannot toggle borrowed book'
                            : b.status === 'available'
                            ? 'Mark as Unavailable'
                            : 'Mark as Available'
                        }
                      >
                        {actionLoadingId === b.id ? (
                          '...'
                        ) : b.status === 'available' ? (
                          <><i className="fa-solid fa-eye-slash"></i> Hide</>
                        ) : (
                          <><i className="fa-solid fa-eye"></i> Show</>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleOpenDelete(b)}
                        disabled={b.status === 'borrowed'}
                        title={
                          b.status === 'borrowed'
                            ? 'Cannot delete a borrowed book'
                            : 'Delete Book'
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
        title="Admin Catalog Deletion"
        message={`Are you sure you want to permanently delete "${bookToDelete?.title}" from the catalog?`}
        confirmText="Confirm Deletion"
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

export default ManageBooks;
