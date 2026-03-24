import React, { useState, useRef } from 'react';
import { api } from '../api';
import './PhotoUploadFlow.css';

export default function PhotoUploadFlow({ matchId, onSuccess, onCancel }) {
  const [step, setStep] = useState('capture'); // capture | preview | consent
  const [photo, setPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Compress image on client side
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const img = new Image();
        img.onload = async () => {
          // Use canvas to compress
          const canvas = document.createElement('canvas');
          const maxWidth = 1920;
          const maxHeight = 1440;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality setting
          canvas.toBlob(
            (blob) => {
              setPhoto(blob);
              setStep('preview');
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = event.target?.result;
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Failed to process image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!photo || !hasConsent) {
      setError('Please confirm consent');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get presigned upload URL
      const { photoId, uploadUrl } = await api.getUploadUrl(matchId, 'image/jpeg');

      // Upload directly to R2 or demo endpoint
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: photo,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload photo');
      }

      // Notify server that upload is complete
      await api.markUploadComplete(photoId);

      // Success - notify parent
      if (onSuccess) {
        onSuccess(photoId);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setStep('capture');
    setCaption('');
    setError('');
  };

  if (step === 'capture') {
    return (
      <div className="photo-upload-flow">
        <div className="upload-header">
          <h2>Share a photo</h2>
        </div>

        <div className="upload-content">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            style={{ display: 'none' }}
          />

          <button
            className="capture-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            📸 Take or choose photo
          </button>

          {error && <div className="error">{error}</div>}

          <button className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="photo-upload-flow">
        <div className="upload-header">
          <h2>Preview & caption</h2>
        </div>

        <div className="upload-content">
          {photo && (
            <img
              src={URL.createObjectURL(photo)}
              alt="Preview"
              className="photo-preview"
            />
          )}

          <textarea
            placeholder="Add a caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={200}
            disabled={loading}
          />

          <div className="consent-section">
            <label className="consent-checkbox">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                disabled={loading}
              />
              <span>
                Jeg bekrefter at jeg har samtykkе fra foreldrene til alle barn som ses i dette bildet
              </span>
            </label>
            <p className="consent-help">
              Bildet vil kun vises for personer som følger laget eller har matchlenkе. En ansvarlig person godkjenner bildet før det publiseres.
            </p>
          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="primary"
            onClick={handleUpload}
            disabled={!hasConsent || loading}
          >
            {loading ? 'Uploading...' : 'Share photo'}
          </button>

          <button
            className="secondary"
            onClick={handleRetake}
            disabled={loading}
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  return null;
}
