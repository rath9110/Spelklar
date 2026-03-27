import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, socket } from '../api';
import StickyLiveScore from '../components/StickyLiveScore';
import BottomNav from '../components/BottomNav';
import './MyFeed.css';

export default function MyFeed() {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
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

      // Transform and fetch photos for each match
      const transformedMatches = await Promise.all(
        matches.map(async (m) => {
          let photos = [];
          try {
            const result = await api.getPhotos(m.id);
            photos = Array.isArray(result) ? result.filter(p => p.status === 'approved') : [];
          } catch (err) {
            console.error('Error fetching photos for match', m.id, err);
          }
          return {
            ...m,
            homeTeam: m.homeTeam?.name || m.homeTeamName,
            awayTeam: m.awayTeam?.name || m.awayTeamName,
            photos,
          };
        })
      );

      setLiveMatches(transformedMatches);

      if (transformedMatches.length > 0) {
        setSelectedMatch(transformedMatches[0]);
      }

      // Build feed items: interleave match headers with photos
      const items = [];
      transformedMatches.forEach((match) => {
        // Add match score card
        items.push({ type: 'match', data: match });
        // Add each photo as its own feed item
        match.photos.forEach((photo) => {
          items.push({ type: 'photo', data: photo, match });
        });
      });
      setFeedItems(items);
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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

      <div className="feed-scroll">
        {feedItems.map((item, index) => {
          if (item.type === 'match') {
            const match = item.data;
            return (
              <div
                key={`match-${match.id}`}
                className="feed-match-card"
                onClick={() => navigate(`/live/${match.id}`)}
              >
                <div className="feed-match-header">
                  <span className="feed-live-badge">LIVE</span>
                  <span className="feed-match-time">{formatTime(match.timerSeconds)}</span>
                </div>
                <div className="feed-match-score">
                  <div className="feed-team">
                    <span className="feed-team-name">{match.homeTeam}</span>
                    <span className="feed-score">{match.homeScore}</span>
                  </div>
                  <span className="feed-separator">–</span>
                  <div className="feed-team">
                    <span className="feed-score">{match.awayScore}</span>
                    <span className="feed-team-name">{match.awayTeam}</span>
                  </div>
                </div>
                {match.photos.length > 0 && (
                  <div className="feed-match-photo-count">
                    {match.photos.length} foto{match.photos.length !== 1 ? 'n' : ''}
                  </div>
                )}
              </div>
            );
          }

          if (item.type === 'photo') {
            const { data: photo, match } = item;
            const imgUrl = photo.storageKey.startsWith('http')
              ? photo.storageKey
              : `https://picsum.photos/seed/${photo.id}/800/600`;

            return (
              <div key={`photo-${photo.id}`} className="feed-photo-card">
                <div className="feed-photo-meta">
                  <span className="feed-photo-uploader">{photo.uploader?.displayName || 'Användare'}</span>
                  <span className="feed-photo-match">{match.homeTeam} vs {match.awayTeam}</span>
                </div>
                <div className="feed-photo-wrapper">
                  <img
                    src={imgUrl}
                    alt={photo.caption || 'Match photo'}
                    className="feed-photo-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/800x600/1a472a/ffffff?text=${encodeURIComponent(photo.caption || 'Foto')}`;
                    }}
                  />
                </div>
                {photo.caption && (
                  <div className="feed-photo-caption">
                    <strong>{photo.uploader?.displayName || 'Användare'}</strong> {photo.caption}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>

      <BottomNav />
    </div>
  );
}
