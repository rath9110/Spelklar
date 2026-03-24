import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followedCount, setFollowedCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }

    // Get followed teams count
    const followed = localStorage.getItem('followedTeams');
    if (followed) {
      try {
        setFollowedCount(JSON.parse(followed).length);
      } catch (e) {
        setFollowedCount(0);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <p>Please log in to view your profile</p>
          <button onClick={() => navigate('/login')}>Log In</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <h2>{user.displayName}</h2>
            <p className="phone">{user.phone}</p>
            <p className="role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
        </div>

        <div className="stats-section">
          <h3>Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{followedCount}</div>
              <div className="stat-label">Teams Following</div>
            </div>
          </div>
        </div>

        <div className="actions-section">
          <button
            className="action-button danger"
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
