import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

const ManageUsers = () => {
  const { showFlash } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manage Users | BookLoop Admin';
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user list.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (targetUser) => {
    if (targetUser.role === 'admin') {
      showFlash('Cannot block an administrator account.', 'warning');
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const endpoint =
        targetUser.status === 'blocked'
          ? `/admin/users/${targetUser.id}/unblock`
          : `/admin/users/${targetUser.id}/block`;

      const res = await api.put(endpoint);
      showFlash(res.data.message || 'User status updated.', 'success');
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? res.data.user : u))
      );
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to update user status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDelete = (u) => {
    if (u.role === 'admin') {
      showFlash('Cannot delete an administrator account.', 'warning');
      return;
    }
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/users/${userToDelete.id}`);
      showFlash(res.data.message || 'User deleted successfully.', 'success');
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to delete user.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.area && u.area.toLowerCase().includes(q))
    );
  });

  return (
    <div className="manage-users-page container">
      <div className="section-header-split">
        <div>
          <h1 className="page-title">Manage Registered Users</h1>
          <p className="page-subtitle">
            Oversee user accounts, monitor trust ratings, and manage disciplinary status.
          </p>
        </div>
        <div className="search-filter-inline">
          <input
            type="text"
            placeholder="Search by name, email, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Loading member registry..." />
      ) : error ? (
        <div className="error-box">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Credits</th>
                <th>Rating & Trust</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={u.status === 'blocked' ? 'row-blocked' : ''}>
                  <td>
                    <div className="user-table-cell">
                      <div className="user-table-avatar">
                        <i className={`fa-solid ${u.role === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
                      </div>
                      <div>
                        <strong>{u.name}</strong>
                        <div className="table-sub-text">{u.email}</div>
                        {u.phone && <div className="table-sub-text"><i className="fa-solid fa-phone"></i> {u.phone}</div>}
                        {u.area && <div className="table-sub-text"><i className="fa-solid fa-location-dot"></i> {u.area}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-role badge-role-${u.role}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-inline status-${u.status}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span className="credit-number-badge">
                      <i className="fa-solid fa-coins"></i> {u.credits}
                    </span>
                  </td>
                  <td>
                    <div className="table-rating-wrap">
                      <span>★ {u.avg_rating > 0 ? u.avg_rating : 'N/A'}</span>
                      <small className="text-muted">({u.rating_count} reviews)</small>
                      {u.is_trusted && (
                        <span className="badge-trusted" title="Trusted Peer">
                          <i className="fa-solid fa-circle-check"></i> Trusted
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="action-buttons-group">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            type="button"
                            className={`btn btn-sm ${
                              u.status === 'blocked' ? 'btn-success' : 'btn-warning'
                            }`}
                            onClick={() => handleToggleBlock(u)}
                            disabled={actionLoadingId === u.id}
                            title={u.status === 'blocked' ? 'Restore User' : 'Suspend Account'}
                          >
                            {actionLoadingId === u.id ? (
                              'Updating...'
                            ) : u.status === 'blocked' ? (
                              <>
                                <i className="fa-solid fa-unlock"></i> Unblock
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-ban"></i> Block
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleOpenDelete(u)}
                            title="Delete User"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${userToDelete?.name}" (${userToDelete?.email})? All associated books and requests will be removed.`}
        confirmText="Yes, Delete User"
        cancelText="Cancel"
        danger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default ManageUsers;
