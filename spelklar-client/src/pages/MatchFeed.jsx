import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, socket } from '../api';
import StickyLiveScore from '../components/StickyLiveScore';
import PhotoUploadFlow from '../components/PhotoUploadFlow';
import './MatchFeed.css';

const EVENT_ICONS = {
  goal: '⚽',
  penalty: '🟨',
  timeout: '⏸',
  sub: '🔄',
};

export default function MatchFeed() {
  const { id: matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchMatch();
    fetchPhotos();
    setupSocket();

    return () => {
      socket.disconnect();
    };
  }, [matchId]);

  const checkUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  };

  const fetchMatch = async () => {
    try {
      const data = await api.getMatch(matchId);
      setMatch(data);
      buildFeedItems(data, photos);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match');
    }
  };

  const fetchPhotos = async () => {
    try {
      const data = await api.getPhotos(matchId);
      setPhotos(data);
      if (match) {
        buildFeedItems(match, data);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildFeedItems = (matchData, photoData) => {
    const items = [];

    // Add events
    if (matchData.events) {
      matchData.events.forEach((event) => {
        items.push({
          type: 'event',
          id: event.id,
          timestamp: new Date(event.timestamp),
          event,
        });
      });
    }

    // Add approved photos
    if (photoData) {
      photoData.forEach((photo) => {
        if (photo.status === 'approved' || photo.status === 'pending') {
          items.push({
            type: 'photo',
            id: photo.id,
            timestamp: new Date(photo.createdAt),
            photo,
          });
        }
      });
    }

    // Sort by timestamp descending (newest first)
    items.sort((a, b) => b.timestamp - a.timestamp);
    setFeedItems(items);
  };

  const setupSocket = () => {
    socket.connect();
    socket.emit('join:match', matchId);

    socket.on('match:update', (updatedMatch) => {
      setMatch(updatedMatch);
      buildFeedItems(updatedMatch, photos);
    });

    socket.on('photo:new', ({ matchId: photoMatchId, photo }) => {
      if (photoMatchId === matchId) {
        setPhotos((prev) => [photo, ...prev]);
        buildFeedItems(match, [photo, ...prev]);
      }
    });

    socket.on('photo:moderated', ({ photoId, status }) => {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, status } : p
        )
      );
    });
  };

  const handlePhotoSuccess = async () => {
    setShowUpload(false);
    // Refetch photos to show the new one
    await fetchPhotos();
  };

  if (loading) {
    return (
      <div className="match-feed">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-feed">
        <div className="error-state">{error || 'Match not found'}</div>
      </div>
    );
  }

  return (
    <div className="match-feed has-sticky-score">
      <StickyLiveScore match={match} />

      <div className="feed-header">
        <h1>{match.homeTeam} vs {match.awayTeam}</h1>
        <p className="feed-meta">
          {match.status === 'live' && '🔴 LIVE'}
          {match.status === 'ended' && '✓ Finished'}
          {match.status === 'pre' && '⏱ Not started'}
        </p>
      </div>

      <div className="feed-container">
        {feedItems.length === 0 ? (
          <div className="empty-feed">
            <p>No events or photos yet</p>
          </div>
        ) : (
          <div className="feed-items">
            {feedItems.map((item) => {
              if (item.type === 'event') {
                const { event } = item;
                return (
                  <div key={item.id} className="feed-item event-item">
                    <div className="event-icon">
                      {EVENT_ICONS[event.type] || '📌'}
                    </div>
                    <div className="event-content">
                      <span className="event-type">
                        {event.type === 'goal' && `${event.team === 'home' ? 'Home' : 'Away'} Goal`}
                        {event.type === 'penalty' && `${event.team === 'home' ? 'Home' : 'Away'} Penalty`}
                        {event.type === 'timeout' && 'Timeout'}
                        {event.type === 'sub' && 'Substitution'}
                      </span>
                      <span className="event-time">
                        {Math.floor(event.timerSeconds / 60)}:{String(event.timerSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              }

              if (item.type === 'photo') {
                const { photo } = item;
                const badgeText = photo.status === 'pending' ? '⏳ Pending' : 'Approved';
                return (
                  <div key={item.id} className="feed-item photo-item">
                    <div className="photo-wrapper">
                      <img
                        src={`/api/photos/${photo.id}`}
                        alt="Match photo"
                        className="photo-thumb"
                      />
                      <span className={`photo-badge ${photo.status}`}>
                        {badgeText}
                      </span>
                    </div>
                    <div className="photo-content">
                      <p className="photo-uploader">
                        📸 {photo.uploader.displayName || 'Anonymous'}
                      </p>
                      {photo.caption && (
                        <p className="photo-caption">{photo.caption}</p>
                      )}
                      <p className="photo-time">
                        {new Date(photo.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      {showUpload && (
        <PhotoUploadFlow
          matchId={matchId}
          onSuccess={handlePhotoSuccess}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {!showUpload && user && match.status !== 'ended' && (
        <button
          className="upload-fab"
          onClick={() => setShowUpload(true)}
          title="Upload photo"
        >
          📷
        </button>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Log in to upload photos</p>
          <a href="/login">Log in</a>
        </div>
      )}
    </div>
  );
}
