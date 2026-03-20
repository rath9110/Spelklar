import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, socket } from '../api';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import StatusDot from '../components/StatusDot';
import './SupporterFeed.css';

const EVENT_ICONS = { goal: '⚽', penalty: '🟥', timeout: '⏱', sub: '↔' };
const EVENT_LABELS = { goal: 'Goal', penalty: 'Penalty', timeout: 'Timeout', sub: 'Substitution' };

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export default function SupporterFeed() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('live');
  const [newEvent, setNewEvent] = useState(null);

  useEffect(() => {
    api.getMatch(id).then(setMatch).catch(() => setConnectionStatus('offline'));

    socket.connect();
    socket.emit('join:match', id);
    socket.on('match:update', (data) => {
      setMatch(prev => {
        // Detect new event for flash animation
        if (prev && data.events.length > prev.events.length) {
          setNewEvent(data.events[data.events.length - 1]);
          setTimeout(() => setNewEvent(null), 2500);
        }
        return data;
      });
    });
    socket.on('connect', () => setConnectionStatus('live'));
    socket.on('disconnect', () => setConnectionStatus('offline'));

    return () => {
      socket.emit('leave:match', id);
      socket.off('match:update');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [id]);

  if (!match) {
    return (
      <div className="supporter-loading page">
        <div className="supporter-loading__spinner" />
        <p className="text-meta">Connecting to match…</p>
      </div>
    );
  }

  return (
    <div className="supporter-feed page" id="supporter-feed">
      {/* Live event flash */}
      {newEvent && (
        <div className="supporter-flash" id="live-event-flash" aria-live="polite">
          <span className="supporter-flash__icon">{EVENT_ICONS[newEvent.type] || '•'}</span>
          <span className="supporter-flash__label">{EVENT_LABELS[newEvent.type] || newEvent.type}</span>
          <span className="supporter-flash__team">
            {newEvent.team === 'home' ? match.homeTeam : newEvent.team === 'away' ? match.awayTeam : ''}
          </span>
        </div>
      )}

      <header className="supporter-header">
        <div className="supporter-brand text-meta">SPELKLAR</div>
        <ScoreBoard
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeScore={match.homeScore}
          awayScore={match.awayScore}
        />
        <Timer seconds={match.timerSeconds} running={match.timerRunning} />
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <StatusDot status={match.status === 'live' ? connectionStatus : 'offline'} />
        </div>
      </header>

      <main className="supporter-events">
        <h2 className="supporter-section-title">Events</h2>
        {match.events.length === 0 ? (
          <p className="text-meta supporter-empty">Waiting for the match to start…</p>
        ) : (
          <div className="supporter-event-list" id="supporter-event-list">
            {[...match.events].reverse().map((evt) => (
              <div key={evt.id} className={`supporter-event-row supporter-event-row--${evt.type}`}>
                <span className="supporter-event-icon">{EVENT_ICONS[evt.type] || '•'}</span>
                <div className="supporter-event-info">
                  <span className="supporter-event-type">{EVENT_LABELS[evt.type]}</span>
                  <span className="supporter-event-team text-meta">
                    {evt.team === 'home' ? match.homeTeam : evt.team === 'away' ? match.awayTeam : ''}
                  </span>
                </div>
                <span className="supporter-event-time text-meta">{fmtTime(evt.timerSeconds)}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="supporter-footer">
        <p className="text-meta" style={{ textAlign: 'center' }}>
          Live updates · Spelklar · Match {id}
        </p>
      </footer>
    </div>
  );
}
