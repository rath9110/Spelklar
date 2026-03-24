import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, socket } from '../api';
import StickyLiveScore from '../components/StickyLiveScore';
import BottomNav from '../components/BottomNav';
import './MyFeed.css';

export default function MyFeed() {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLiveMatches();
    setupSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      const matches = await api.getMyLiveMatches();
      setLiveMatches(matches);

      if (matches.length > 0) {
        setSelectedMatch(matches[0]);
      }
    } catch (err) {
      console.error('Error fetching live matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    socket.connect();

    socket.on('match:update', (match) => {
      setLiveMatches((prev) =>
        prev.map((m) =>
          m.id === match.id ? match : m
        )
      );

      if (selectedMatch?.id === match.id) {
        setSelectedMatch(match);
      }
    });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) {
    return (
      <div className="my-feed">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <div className="my-feed">
        <div className="empty-state">
          <p>No live matches from teams you follow</p>
          <a href="/teams">Browse teams to follow</a>
          <button className="secondary" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="my-feed has-sticky-score has-bottom-nav">
      {selectedMatch && (
        <StickyLiveScore
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      <div className="feed-header">
        <h1>Live Matches</h1>
      </div>

      <div className="matches-list">
        {liveMatches.map((match) => (
          <div
            key={match.id}
            className="match-card"
            onClick={() => navigate(`/live/${match.id}`)}
          >
            <div className="match-badge">LIVE</div>
            <div className="match-teams">
              <div className="team">
                <span className="team-name">{match.homeTeam}</span>
                <span className="score">{match.homeScore}</span>
              </div>
              <div className="vs">vs</div>
              <div className="team">
                <span className="score">{match.awayScore}</span>
                <span className="team-name">{match.awayTeam}</span>
              </div>
            </div>
            <div className="match-time">
              {Math.floor(match.timerSeconds / 60)}:{String(match.timerSeconds % 60).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      <div className="feed-footer">
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
