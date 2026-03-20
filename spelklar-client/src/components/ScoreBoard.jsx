import React from 'react';
import './ScoreBoard.css';

export default function ScoreBoard({ homeTeam, awayTeam, homeScore, awayScore }) {
  return (
    <div className="scoreboard" id="scoreboard">
      {/* Row 1: team names — always aligned */}
      <div className="scoreboard__names">
        <span className="text-team scoreboard__name scoreboard__name--home">{homeTeam}</span>
        <span className="scoreboard__names-gap" />
        <span className="text-team scoreboard__name scoreboard__name--away">{awayTeam}</span>
      </div>
      {/* Row 2: scores — always aligned */}
      <div className="scoreboard__scores">
        <span className="text-score scoreboard__score" id="home-score">{homeScore}</span>
        <span className="scoreboard__divider">–</span>
        <span className="text-score scoreboard__score" id="away-score">{awayScore}</span>
      </div>
    </div>
  );
}
