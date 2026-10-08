import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | BookLoop';
  }, []);

  return (
    <div className="not-found-page container">
      <div className="not-found-card">
        <div className="not-found-icon">
          <i className="fa-solid fa-book-skull"></i>
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          Looks like this page got lost between chapters or never existed in the catalog.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="fa-solid fa-house"></i> Return Home
          </Link>
          <Link to="/browse" className="btn btn-outline btn-lg">
            <i className="fa-solid fa-magnifying-glass"></i> Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
