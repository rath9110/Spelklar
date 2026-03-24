import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`}>
        <span className="icon">📺</span>
        <span className="label">Feed</span>
      </Link>
      <Link to="/teams" className={`nav-item ${isActive('/teams') ? 'active' : ''}`}>
        <span className="icon">⚽</span>
        <span className="label">Teams</span>
      </Link>
      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <span className="icon">👤</span>
        <span className="label">Profile</span>
      </Link>
    </nav>
  );
}
