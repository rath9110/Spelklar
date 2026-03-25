import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StickyLiveScore.css';

export default function StickyLiveScore({ match, onClose }) {
  const navigate = useNavigate();

  if (!match) return null;

  const handleClick = () => {
    navigate(`/live/${match.id}`);
  };

  return (
    <div className="sticky-live-score" onClick={handleClick}>
      <div className="live-indicator">
        <span className="pulse">●</span>
        LIVE
      </div>

      <div className="score-container">
        <div className="team team-home">
          <span className="team-name">
            {match.homeTeam || 'Home'}
          </span>
          <span className="score">{match.homeScore}</span>
        </div>

        <div className="timer">
          {Math.floor(match.timerSeconds / 60)}:{String(match.timerSeconds % 60).padStart(2, '0')}
        </div>

        <div className="team team-away">
          <span className="team-name">
            {match.awayTeam || 'Away'}
          </span>
          <span className="score">{match.awayScore}</span>
        </div>
      </div>

      <button
        className="close-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      >
        ✕
      </button>
    </div>
  );
}
