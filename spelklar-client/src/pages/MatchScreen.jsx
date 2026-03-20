import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, socket } from '../api';
import ActionButton from '../components/ActionButton';
import UndoBar from '../components/UndoBar';
import StatusDot from '../components/StatusDot';
import Timer from '../components/Timer';
import ScoreBoard from '../components/ScoreBoard';
import EventLog from '../components/EventLog';
import './MatchScreen.css';

// Which team scored/penalized? Cycle home → away → none for simplicity in MVP
const ACTION_TYPES = [
  { type: 'goal',    label: 'Goal',    hasTeam: true },
  { type: 'penalty', label: 'Penalty', hasTeam: true },
  { type: 'timeout', label: 'Timeout', hasTeam: true },
  { type: 'sub',     label: 'Sub',     hasTeam: false },
];

export default function MatchScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('live');
  const [undoData, setUndoData] = useState(null); // { message }
  const [pendingTeam, setPendingTeam] = useState(null); // team picker overlay
  const [pendingType, setPendingType] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const undoTimeoutRef = useRef(null);

  // Load match + connect socket
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await api.getMatch(id);
        if (!mounted) return;
        if (data.error) { navigate('/'); return; }
        setMatch(data);
      } catch {
        setConnectionStatus('offline');
      }
    };
    load();

    socket.connect();
    socket.emit('join:match', id);
    socket.on('match:update', (data) => {
      if (mounted) setMatch(data);
    });
    socket.on('connect', () => setConnectionStatus('live'));
    socket.on('disconnect', () => setConnectionStatus('offline'));
    socket.on('connect_error', () => setConnectionStatus('offline'));

    return () => {
      mounted = false;
      socket.emit('leave:match', id);
      socket.off('match:update');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [id]);

  // Auto-copy live link on match start
  const handleStart = async () => {
    setInitiating(true);
    try {
      const data = await api.startMatch(id);
      setMatch(data);
      const liveUrl = `${window.location.origin}/live/${id}`;
      try { await navigator.clipboard.writeText(liveUrl); } catch {}
    } finally {
      setInitiating(false);
    }
  };

  // Show team picker for team-based events, or log directly for sub
  const handleAction = (type) => {
    const action = ACTION_TYPES.find(a => a.type === type);
    if (action?.hasTeam) {
      setPendingType(type);
      setPendingTeam('pick');
    } else {
      logEvent(type, null);
    }
  };

  const logEvent = useCallback(async (type, team) => {
    setPendingTeam(null);
    setPendingType(null);
    try {
      const data = await api.logEvent(id, type, team);
      setMatch(data);
      const labels = { goal: 'Goal', penalty: 'Penalty', timeout: 'Timeout', sub: 'Substitution' };
      setUndoData({ message: `${labels[type] || type} registered` });
      clearTimeout(undoTimeoutRef.current);
    } catch {}
  }, [id]);

  const handleUndo = async () => {
    setUndoData(null);
    try {
      const data = await api.undoEvent(id);
      setMatch(data);
    } catch {}
  };

  const handleUndoExpire = () => {
    setUndoData(null);
  };

  const isLive = match?.status === 'live';
  const isEnded = match?.status === 'ended';
  const liveUrl = `${window.location.origin}/live/${id}`;

  if (!match) {
    return (
      <div className="match-loading page">
        <div className="match-loading__spinner" />
        <p className="text-meta">Loading match…</p>
      </div>
    );
  }

  return (
    <div className="match-screen page" id="match-screen">

      {/* Header: score + timer */}
      <header className="match-header">
        <ScoreBoard
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          homeScore={match.homeScore}
          awayScore={match.awayScore}
        />
        <Timer seconds={match.timerSeconds} running={match.timerRunning} />
      </header>

      {/* Action grid */}
      <main className="match-actions" aria-label="Match actions">
        {isEnded ? (
          <div className="match-ended-message">
            <p className="text-team">Match ended</p>
            <button
              className="btn-primary"
              id="btn-view-summary"
              onClick={() => navigate(`/match/${id}/end`)}
              style={{ marginTop: 'var(--space-md)', maxWidth: 320, alignSelf: 'center' }}
            >
              View summary →
            </button>
          </div>
        ) : !isLive ? (
          <div className="match-pre-start">
            <div className="match-code-display">
              <p className="text-meta" style={{ marginBottom: 'var(--space-xs)' }}>Match code</p>
              <p className="match-code-value" id="match-code-display">{id}</p>
              <p className="text-meta" style={{ marginTop: 'var(--space-xs)' }}>
                Share: <a href={liveUrl} target="_blank" rel="noreferrer" className="live-link">{liveUrl}</a>
              </p>
            </div>
            <button
              className="btn-primary"
              id="btn-start-match"
              onClick={handleStart}
              disabled={initiating}
              style={{ maxWidth: 320, alignSelf: 'center', width: '100%' }}
            >
              {initiating ? 'Starting…' : '▶ Start match'}
            </button>
          </div>
        ) : (
          <div className="match-btn-grid" id="action-grid">
            {ACTION_TYPES.map(({ type, label }) => (
              <ActionButton
                key={type}
                type={type}
                label={label}
                onPress={handleAction}
                disabled={!!pendingTeam}
              />
            ))}
          </div>
        )}
      </main>

      {/* Event log */}
      <section className="match-events">
        <EventLog
          events={match.events}
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
        />
      </section>

      {/* Status bar */}
      <footer className="match-footer">
        <StatusDot status={connectionStatus} />
        {isLive && (
          <div className="match-footer__right">
            <button
              className="btn-end-match"
              id="btn-end-match"
              onClick={async () => {
                await api.endMatch(id);
                navigate(`/match/${id}/end`);
              }}
            >
              End match
            </button>
            <button
              className="btn-share"
              id="btn-share"
              onClick={() => {
                navigator.clipboard.writeText(liveUrl).catch(() => {});
              }}
              title="Copy live link"
            >
              Share link
            </button>
          </div>
        )}
      </footer>

      {/* Team picker overlay */}
      {pendingTeam === 'pick' && (
        <div className="team-picker-overlay" id="team-picker" role="dialog" aria-modal="true">
          <div className="team-picker-content">
            <p className="team-picker-title text-label">Which team?</p>
            <div className="team-picker-btns">
              <button
                className="team-picker-btn"
                id="btn-team-home"
                onClick={() => logEvent(pendingType, 'home')}
              >
                {match.homeTeam}
              </button>
              <button
                className="team-picker-btn"
                id="btn-team-away"
                onClick={() => logEvent(pendingType, 'away')}
              >
                {match.awayTeam}
              </button>
            </div>
            <button
              className="btn-ghost"
              id="btn-team-cancel"
              onClick={() => { setPendingTeam(null); setPendingType(null); }}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Undo bar */}
      {undoData && (
        <UndoBar
          message={undoData.message}
          onUndo={handleUndo}
          onExpire={handleUndoExpire}
        />
      )}
    </div>
  );
}
