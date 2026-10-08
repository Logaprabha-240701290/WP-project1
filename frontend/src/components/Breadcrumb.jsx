import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/">
            <i className="fa-solid fa-house"></i> Home
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              <span className="breadcrumb-separator">/</span>
              {isLast || !item.link ? (
                <span className="breadcrumb-current">{item.label}</span>
              ) : (
                <Link to={item.link}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
