import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import './TeamPage.css';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTeam();
    checkUser();
  }, [id]);

  const checkUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  };

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await api.getTeam(id);
      setTeam(data);
      // TODO: Check if user is following this team
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await api.unfollowTeam(id);
      } else {
        await api.followTeam(id);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="team-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!team || error) {
    return (
      <div className="team-page">
        <div className="error-state">
          <p>{error || 'Team not found'}</p>
          <button onClick={() => navigate('/teams')}>Back to teams</button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page has-bottom-nav">
      <div className="team-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>{team.name}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="team-info">
        <div className="info-section">
          <label>Club</label>
          <p>{team.club?.name || 'N/A'}</p>
        </div>

        <div className="info-section">
          <label>Followers</label>
          <p>{team._count?.follows || 0} people following</p>
        </div>
      </div>

      <div className="team-actions">
        <button
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
          onClick={handleFollowToggle}
        >
          {isFollowing ? '✓ Following' : '+ Follow'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
