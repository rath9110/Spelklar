import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StickyLiveScore.css';

export default function StickyLiveScore({ match, onClose }) {
  const navigate = useNavigate();
  const [timerSeconds, setTimerSeconds] = useState(match?.timerSeconds || 0);

  useEffect(() => {
    setTimerSeconds(match?.timerSeconds || 0);
  }, [match?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
          {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
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
