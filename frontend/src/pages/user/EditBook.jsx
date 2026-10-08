import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { validateImageFile } from '../../utils/validators';

const GENRES = [
  'Technology',
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mystery',
  'Fantasy',
  'Biography',
  'Economics',
  'Self-Help',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showFlash } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Technology',
    condition: 'Good',
    type: 'lend',
    description: '',
  });

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/books/${id}`);
      const b = res.data;

      // Ensure ownership or admin
      if (user && b.owner_id !== user.id && user.role !== 'admin') {
        showFlash('You do not have permission to edit this book.', 'error');
        navigate('/my-books', { replace: true });
        return;
      }

      setFormData({
        title: b.title || '',
        author: b.author || '',
        genre: b.genre || 'Technology',
        condition: b.condition || 'Good',
        type: b.type || 'lend',
        description: b.description || '',
      });
      setCurrentImageUrl(b.image_url || null);
      document.title = `Edit: ${b.title} | BookLoop`;
    } catch (err) {
      console.error(err);
      showFlash('Failed to load book for editing.', 'error');
      navigate('/my-books');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.author.trim()) errs.author = 'Author is required';

    if (imageFile) {
      const imgValidation = validateImageFile(imageFile);
      if (!imgValidation.valid) {
        errs.image = imgValidation.error;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrors((prev) => ({ ...prev, image: validation.error }));
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setErrors((prev) => ({ ...prev, image: null }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('author', formData.author.trim());
      data.append('genre', formData.genre);
      data.append('condition', formData.condition);
      data.append('type', formData.type);
      data.append('description', formData.description.trim());

      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.put(`/books/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showFlash('Book listing updated successfully!', 'success');
      navigate('/my-books');
    } catch (err) {
      console.error(err);
      showFlash(err.response?.data?.error || 'Failed to update book.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching book details..." fullScreen />;
  }

  return (
    <div className="edit-book-page container">
      <Breadcrumb
        items={[
          { label: 'My Books', link: '/my-books' },
          { label: `Edit: ${formData.title}` },
        ]}
      />

      <div className="form-card-centered">
        <div className="form-header">
          <div className="form-icon-wrap">
            <i className="fa-solid fa-pen-to-square"></i>
          </div>
          <h1 className="form-title">Edit Book Listing</h1>
          <p className="form-subtitle">Update details, condition, or cover photo for this title.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="edit-title">Book Title *</label>
            <input
              id="edit-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-author">Author *</label>
            <input
              id="edit-author"
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`form-input ${errors.author ? 'input-error' : ''}`}
            />
            {errors.author && <span className="field-error">{errors.author}</span>}
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="edit-genre">Genre *</label>
              <select
                id="edit-genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="form-select"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-col">
              <label htmlFor="edit-condition">Condition *</label>
              <select
                id="edit-condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="form-select"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Listing Type *</label>
            <div className="listing-type-selection">
              <label
                className={`type-radio-label ${formData.type === 'lend' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="lend"
                  checked={formData.type === 'lend'}
                  onChange={handleChange}
                />
                <div className="radio-content">
                  <div className="radio-title">
                    <i className="fa-solid fa-hand-holding-heart"></i> Lend Listing
                  </div>
                  <p className="radio-desc">Standard 14-day student book lending flow.</p>
                </div>
              </label>

              <label
                className={`type-radio-label ${formData.type === 'exchange' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="exchange"
                  checked={formData.type === 'exchange'}
                  onChange={handleChange}
                />
                <div className="radio-content">
                  <div className="radio-title">
                    <i className="fa-solid fa-arrow-right-arrow-left"></i> Exchange Listing
                  </div>
                  <p className="radio-desc">Swap or borrow using credits.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description & Notes</label>
            <textarea
              id="edit-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          {/* Cover photo preview and upload */}
          <div className="form-group">
            <label>Cover Photo</label>
            <div className="edit-cover-preview-row">
              {imagePreview ? (
                <div className="preview-wrap">
                  <img src={imagePreview} alt="New cover" className="image-preview-img" />
                  <span className="badge-new-photo">New Selection</span>
                </div>
              ) : currentImageUrl ? (
                <div className="preview-wrap">
                  <img src={currentImageUrl} alt="Current cover" className="image-preview-img" />
                  <span className="badge-current-photo">Current Photo</span>
                </div>
              ) : null}

              <div className="edit-file-input-col">
                <input
                  type="file"
                  id="edit-book-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
                <label htmlFor="edit-book-image" className="btn btn-outline">
                  <i className="fa-solid fa-camera"></i>{' '}
                  {currentImageUrl || imagePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Reset Photo
                  </button>
                )}
                {errors.image && <span className="field-error">{errors.image}</span>}
              </div>
            </div>
          </div>

          <div className="form-action-row">
            <Link to="/my-books" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
