import React from 'react';
import { useAuth } from '../context/AuthContext';

const FlashMessage = () => {
  const { flash, clearFlash } = useAuth();

  if (!flash) return null;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-triangle-exclamation',
    warning: 'fa-circle-exclamation',
    info: 'fa-circle-info',
  };

  const iconClass = iconMap[flash.type] || 'fa-bell';

  return (
    <div className={`flash-toast flash-${flash.type}`} role="alert">
      <div className="flash-content">
        <i className={`fa-solid ${iconClass} flash-icon`}></i>
        <span>{flash.message}</span>
      </div>
      <button className="flash-close" onClick={clearFlash} aria-label="Dismiss notification">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default FlashMessage;
