import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Breadcrumb from '../../components/Breadcrumb';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validators';

const Contact = () => {
  const { user, showFlash } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Support | BookLoop';
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Your name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.message.trim()) {
      errs.message = 'Message cannot be empty';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      showFlash('Thank you! Your message has been sent successfully.', 'success');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (err) {
      showFlash(err.response?.data?.error || 'Failed to submit contact request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page container">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="contact-layout">
        {/* Contact Info Sidebar */}
        <div className="contact-sidebar">
          <span className="section-tag">Get In Touch</span>
          <h1 className="contact-title">We'd love to hear from you</h1>
          <p className="contact-intro">
            Have a suggestion, question about an exchange, or encountering a technical bug?
            Reach out through our campus support portal.
          </p>

          <div className="contact-info-cards">
            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <h4>Campus Hub</h4>
                <p>Central Campus Library, Student Help Desk, Room 204</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <h4>Email Support</h4>
                <p>support@bookloop.edu</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <h4>Operating Hours</h4>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-card">
          {submitted ? (
            <div className="contact-success-view">
              <div className="success-icon-wrap">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2>Message Delivered!</h2>
              <p>
                Thank you for reaching out. A campus support coordinator will review your note and get back to you shortly.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="form-heading">Send Us a Message</h2>

              <div className="form-group">
                <label htmlFor="contact-name">Your Full Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@example.com"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject *</label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Inquiry regarding book exchange return"
                  className={`form-input ${errors.subject ? 'input-error' : ''}`}
                />
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question or issue in detail..."
                  className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Sending Message...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
