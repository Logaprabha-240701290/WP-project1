import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-logo-icon">
            <i className="fa-solid fa-book-bookmark"></i>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">Book<span className="brand-accent">Loop</span></span>
            <span className="brand-sub">Smart Book Exchange</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Navigation Links */}
        <nav className={`navbar-links ${mobileMenuOpen ? 'nav-open' : ''}`}>
          {/* Admin Navigation */}
          {isAuthenticated && isAdmin ? (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-chart-pie"></i> Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-users-gear"></i> Manage Users
              </NavLink>
              <NavLink to="/admin/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-book"></i> Manage Books
              </NavLink>
              <div className="nav-user-panel">
                <span className="admin-badge">
                  <i className="fa-solid fa-shield-halved"></i> Admin: {user?.name}
                </span>
                <button type="button" onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            </>
          ) : isAuthenticated ? (
            /* Logged In Regular User Navigation */
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-gauge"></i> Dashboard
              </NavLink>
              <NavLink to="/browse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-compass"></i> Browse
              </NavLink>
              <NavLink to="/my-books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-book-bookmark"></i> My Books
              </NavLink>
              <NavLink to="/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-bell"></i> Requests
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-heart"></i> Wishlist
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                <i className="fa-solid fa-user"></i> Profile
              </NavLink>

              {/* User badge with live credits and logout */}
              <div className="nav-user-panel">
                <span className="credit-pill" title="Available Book Credits">
                  <i className="fa-solid fa-coins"></i> <strong>{user?.credits}</strong> Credits
                </span>
                <span className="nav-username" title={user?.name}>
                  {user?.name?.split(' ')[0]}
                </span>
                <button type="button" onClick={handleLogout} className="btn-logout" title="Sign Out">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </>
          ) : (
            /* Public / Guest Navigation */
            <>
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/browse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Browse Books
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                About
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                Contact
              </NavLink>
              <div className="nav-auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Get Started
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
