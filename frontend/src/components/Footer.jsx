import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <i className="fa-solid fa-book-bookmark"></i>
              <span>Book<strong>Loop</strong></span>
            </div>
            <p className="footer-desc">
              Smart Book Lending and Exchange Platform designed for college students and book lovers.
              Share stories, discover knowledge, and keep books circulating.
            </p>
            <div className="footer-features-preview">
              <span className="feat-chip"><i className="fa-solid fa-coins"></i> Credit-Based Loans</span>
              <span className="feat-chip"><i className="fa-solid fa-handshake"></i> Direct Swaps</span>
              <span className="feat-chip"><i className="fa-solid fa-certificate"></i> Trusted Ratings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-link-list">
              <li><Link to="/"><i className="fa-solid fa-angle-right"></i> Home</Link></li>
              <li><Link to="/browse"><i className="fa-solid fa-angle-right"></i> Browse Library</Link></li>
              <li><Link to="/about"><i className="fa-solid fa-angle-right"></i> How It Works</Link></li>
              <li><Link to="/contact"><i className="fa-solid fa-angle-right"></i> Contact Support</Link></li>
            </ul>
          </div>

          {/* Account & Safety */}
          <div className="footer-col">
            <h4 className="footer-heading">Member Area</h4>
            <ul className="footer-link-list">
              <li><Link to="/login"><i className="fa-solid fa-angle-right"></i> Member Login</Link></li>
              <li><Link to="/register"><i className="fa-solid fa-angle-right"></i> Join BookLoop</Link></li>
              <li><Link to="/admin/login"><i className="fa-solid fa-angle-right"></i> Administrator Portal</Link></li>
            </ul>
          </div>

          {/* College Project Credit */}
          <div className="footer-col">
            <h4 className="footer-heading">Project Specs</h4>
            <p className="project-note">
              College Web Programming Capstone Project. Built with React 18, Vite, Flask 3, and SQLite.
            </p>
            <div className="tech-badge-row">
              <span className="tech-tag">React</span>
              <span className="tech-tag">Flask</span>
              <span className="tech-tag">SQLite</span>
              <span className="tech-tag">JWT</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>&copy; {new Date().getFullYear()} BookLoop. All rights reserved. Built for College Web Programming.</p>
          <div className="footer-bottom-links">
            <Link to="/about">About System</Link>
            <span>&bull;</span>
            <Link to="/contact">Help & Contact</Link>
            <span>&bull;</span>
            <Link to="/admin/login">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
