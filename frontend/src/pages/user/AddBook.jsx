import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
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
  'Self-Help'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const AddBook = () => {
  const navigate = useNavigate();
  const { showFlash } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Technology',
    condition: 'Good',
    type: 'lend',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'List a Book | BookLoop';
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Book title is required';
    if (!formData.author.trim()) errs.author = 'Author name is required';
    if (!formData.genre) errs.genre = 'Genre selection is required';
    if (!formData.condition) errs.condition = 'Condition selection is required';

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
      if (formData.description.trim()) {
        data.append('description', formData.description.trim());
      }
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showFlash('Book listed successfully in the library catalog!', 'success');
      navigate('/my-books');
    } catch (err) {
      console.error(err);
      showFlash(err.response?.data?.error || 'Failed to list book.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-book-page container">
      <Breadcrumb
        items={[
          { label: 'My Books', link: '/my-books' },
          { label: 'List a Book' },
        ]}
      />

      <div className="form-card-centered">
        <div className="form-header">
          <div className="form-icon-wrap">
            <i className="fa-solid fa-book-medical"></i>
          </div>
          <h1 className="form-title">List a Book for Sharing</h1>
          <p className="form-subtitle">
            Provide details about the book you want to lend or exchange with campus members.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="book-title">Book Title *</label>
            <input
              id="book-title"
              type="text"
              name="title"
              placeholder="e.g. Clean Code: A Handbook of Agile Craftsmanship"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="book-author">Author(s) *</label>
            <input
              id="book-author"
              type="text"
              name="author"
              placeholder="e.g. Robert C. Martin"
              value={formData.author}
              onChange={handleChange}
              className={`form-input ${errors.author ? 'input-error' : ''}`}
            />
            {errors.author && <span className="field-error">{errors.author}</span>}
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="book-genre">Genre *</label>
              <select
                id="book-genre"
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
              <label htmlFor="book-condition">Physical Condition *</label>
              <select
                id="book-condition"
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

          {/* Listing Type Radio Cards */}
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
                  <p className="radio-desc">
                    Lend your book to a peer for a 14-day duration using the standard credit system.
                  </p>
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
                  <p className="radio-desc">
                    Swap or borrow using credits. Highlight your openness to exchange for other reads.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="book-description">Description & Notes (Optional)</label>
            <textarea
              id="book-description"
              name="description"
              rows="4"
              placeholder="Highlight edition, key topics, notes or any specific pickup guidelines..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          {/* Image Upload with Live Preview */}
          <div className="form-group">
            <label>Cover Photo (Optional)</label>
            <p className="field-hint">JPG, PNG, or WebP up to 2MB. A clean placeholder is generated if left empty.</p>

            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview-img" />
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm preview-remove-btn"
                  onClick={handleRemoveImage}
                >
                  <i className="fa-solid fa-trash"></i> Remove Photo
                </button>
              </div>
            ) : (
              <div className="file-upload-box">
                <input
                  type="file"
                  id="book-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
                <label htmlFor="book-image" className="file-upload-label">
                  <i className="fa-solid fa-cloud-arrow-up file-icon"></i>
                  <span className="file-upload-text">Click to browse or drop cover image here</span>
                  <span className="file-types-hint">Supported formats: JPG, PNG, WebP (Max 2MB)</span>
                </label>
              </div>
            )}
            {errors.image && <span className="field-error">{errors.image}</span>}
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
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving Book...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Publish Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
