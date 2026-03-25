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

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatches((prev) =>
        prev.map((m) => ({
          ...m,
          timerSeconds: Math.max(0, m.timerSeconds - 1),
        }))
      );

      if (selectedMatch) {
        setSelectedMatch((prev) => ({
          ...prev,
          timerSeconds: Math.max(0, prev.timerSeconds - 1),
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedMatch]);

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      const matches = await api.getMyLiveMatches();

      // Transform API response to match expected format
      const transformedMatches = matches.map(m => ({
        ...m,
        homeTeam: m.homeTeam?.name || m.homeTeamName,
        awayTeam: m.awayTeam?.name || m.awayTeamName,
      }));

      setLiveMatches(transformedMatches);

      if (transformedMatches.length > 0) {
        setSelectedMatch(transformedMatches[0]);
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
      // Transform match data to expected format
      const transformed = {
        ...match,
        homeTeam: match.homeTeam?.name || match.homeTeamName,
        awayTeam: match.awayTeam?.name || match.awayTeamName,
      };

      setLiveMatches((prev) =>
        prev.map((m) =>
          m.id === match.id ? transformed : m
        )
      );

      if (selectedMatch?.id === match.id) {
        setSelectedMatch(transformed);
      }
    });
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

      <BottomNav />
    </div>
  );
}
