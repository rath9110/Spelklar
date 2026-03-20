import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import './PostMatch.css';

const EVENT_LABELS = { goal: 'Goal', penalty: 'Penalty', timeout: 'Timeout', sub: 'Substitution' };

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export default function PostMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    api.getMatch(id).then(setMatch).catch(() => {});
  }, [id]);

  if (!match) return <div className="postmatch-loading page"><p className="text-meta">Loading…</p></div>;

  const csvRows = [
    ['Time', 'Event', 'Team'],
    ...match.events.map(e => [
      fmtTime(e.timerSeconds),
      EVENT_LABELS[e.type] || e.type,
      e.team === 'home' ? match.homeTeam : e.team === 'away' ? match.awayTeam : '',
    ])
  ];

  const downloadCsv = () => {
    const content = csvRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spelklar-${id}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="postmatch page" id="postmatch-page">
      <div className="postmatch__inner">
        <div className="postmatch__header">
          <div className="postmatch__badge">match ended</div>
          <h1 className="postmatch__score text-score">
            {match.homeScore} – {match.awayScore}
          </h1>
          <p className="text-team" style={{ color: 'var(--color-muted)' }}>
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <p className="text-meta">Duration: {fmtTime(match.timerSeconds)}</p>
        </div>

        {/* Event summary */}
        <div className="postmatch__events card">
          <h2 className="postmatch__section-title">Events ({match.events.length})</h2>
          {match.events.length === 0 ? (
            <p className="text-meta">No events recorded.</p>
          ) : (
            <table className="postmatch__table" id="events-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {match.events.map(e => (
                  <tr key={e.id}>
                    <td className="text-meta font-mono">{fmtTime(e.timerSeconds)}</td>
                    <td>{EVENT_LABELS[e.type] || e.type}</td>
                    <td className="text-meta">
                      {e.team === 'home' ? match.homeTeam : e.team === 'away' ? match.awayTeam : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="postmatch__actions">
          <button className="btn-primary" id="btn-download-csv" onClick={downloadCsv}>
            Export CSV
          </button>
          <button
            className="btn-ghost"
            id="btn-new-match"
            onClick={() => navigate('/')}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            New match
          </button>
        </div>
      </div>
    </div>
  );
}
