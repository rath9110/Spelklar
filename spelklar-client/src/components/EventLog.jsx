import React from 'react';
import './EventLog.css';

const EVENT_ICONS = {
  goal:    { icon: '⚽', color: 'var(--color-goal)' },
  penalty: { icon: '🟥', color: 'var(--color-penalty)' },
  timeout: { icon: '⏱', color: 'var(--color-timeout)' },
  sub:     { icon: '↔', color: 'var(--color-sub)' },
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function formatType(type, team) {
  const labels = { goal: 'Goal', penalty: 'Penalty', timeout: 'Timeout', sub: 'Substitution' };
  return labels[type] || type;
}

export default function EventLog({ events = [], homeTeam, awayTeam }) {
  if (events.length === 0) {
    return (
      <div className="event-log event-log--empty" id="event-log">
        <p className="text-meta">No events yet. Tap an action above.</p>
      </div>
    );
  }

  return (
    <div className="event-log" id="event-log" aria-label="Match events">
      {[...events].reverse().map((evt) => {
        const cfg = EVENT_ICONS[evt.type] || { icon: '•', color: 'var(--color-muted)' };
        const teamName = evt.team === 'home' ? homeTeam : evt.team === 'away' ? awayTeam : '';
        return (
          <div key={evt.id} className="event-log__item" style={{ '--event-color': cfg.color }}>
            <span className="event-log__time text-meta">{formatTime(evt.timerSeconds)}</span>
            <span className="event-log__icon">{cfg.icon}</span>
            <span className="event-log__desc">
              <span className="event-log__type">{formatType(evt.type)}</span>
              {teamName && <span className="event-log__team text-meta"> · {teamName}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
