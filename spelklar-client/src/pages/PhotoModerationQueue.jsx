import React, { useState, useEffect } from 'react';
import { api, socket } from '../api';
import './PhotoModerationQueue.css';

export default function PhotoModerationQueue() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPendingPhotos();
    setupSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPendingPhotos = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    socket.connect();

    socket.on('photo:new', () => {
      // Refetch on new photo
      fetchPendingPhotos();
    });

    socket.on('photo:moderated', () => {
      // Refetch on moderation
      fetchPendingPhotos();
    });
  };

  const handleApprove = async (photoId) => {
    try {
      await api.moderatePhoto(photoId, 'approved');
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (err) {
      console.error('Error approving photo:', err);
      setError('Failed to approve photo');
    }
  };

  const handleReject = async (photoId) => {
    try {
      await api.moderatePhoto(photoId, 'rejected');
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (err) {
      console.error('Error rejecting photo:', err);
      setError('Failed to reject photo');
    }
  };

  if (loading) {
    return (
      <div className="moderation-queue">
        <div className="loading">Loading photos...</div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="moderation-queue">
        <div className="empty-state">
          <p>✓ No pending photos</p>
          <small>All photos have been reviewed</small>
        </div>
      </div>
    );
  }

  return (
    <div className="moderation-queue">
      <div className="queue-header">
        <h1>Photo Moderation</h1>
        <p className="queue-count">{photos.length} pending</p>
      </div>

      {error && <div className="error">{error}</div>}

      {selectedPhoto ? (
        <div className="photo-detail">
          <button className="back-btn" onClick={() => setSelectedPhoto(null)}>
            ← Back
          </button>

          <img
            src={`/api/photos/${selectedPhoto.id}`}
            alt="Photo for moderation"
            className="detail-photo"
          />

          <div className="photo-info">
            <div className="info-row">
              <label>Match</label>
              <p>
                {selectedPhoto.match.homeTeamName} vs{' '}
                {selectedPhoto.match.awayTeamName}
              </p>
            </div>

            <div className="info-row">
              <label>Uploaded by</label>
              <p>{selectedPhoto.uploader.displayName}</p>
            </div>

            {selectedPhoto.caption && (
              <div className="info-row">
                <label>Caption</label>
                <p>{selectedPhoto.caption}</p>
              </div>
            )}

            <div className="info-row">
              <label>Consents</label>
              <p>
                {selectedPhoto.consents.length} person{selectedPhoto.consents.length !== 1 ? 's' : ''} confirmed
              </p>
            </div>

            <div className="moderation-actions">
              <button
                className="approve-btn"
                onClick={() => handleApprove(selectedPhoto.id)}
              >
                ✓ Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleReject(selectedPhoto.id)}
              >
                ✕ Reject
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="queue-grid">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="queue-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="queue-photo">
                <img
                  src={`/api/photos/${photo.id}`}
                  alt="Pending photo"
                />
              </div>
              <div className="queue-info">
                <p className="match-name">
                  {photo.match.homeTeamName} vs {photo.match.awayTeamName}
                </p>
                <p className="uploader-name">
                  {photo.uploader.displayName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
