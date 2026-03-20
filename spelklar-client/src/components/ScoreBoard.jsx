import React from 'react';
import './ScoreBoard.css';

export default function ScoreBoard({ homeTeam, awayTeam, homeScore, awayScore }) {
  return (
    <div className="scoreboard" id="scoreboard">
      <div className="scoreboard__team">
        <span className="text-team scoreboard__name">{homeTeam}</span>
        <span className="text-score scoreboard__score" id="home-score">{homeScore}</span>
      </div>
      <div className="scoreboard__divider">–</div>
      <div className="scoreboard__team scoreboard__team--away">
        <span className="text-score scoreboard__score" id="away-score">{awayScore}</span>
        <span className="text-team scoreboard__name">{awayTeam}</span>
      </div>
    </div>
  );
}
