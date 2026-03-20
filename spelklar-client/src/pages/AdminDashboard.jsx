import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './AdminDashboard.css';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

const STATUS_LABELS = { pre: 'Not started', live: 'Live', ended: 'Ended' };

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getAllMatches().then((data) => {
      setMatches(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  }, []);

  const downloadAllCsv = () => {
    if (matches.length === 0) return;
    const rows = [['Match ID', 'Home', 'Away', 'Home Score', 'Away Score', 'Duration', 'Status', 'Events']];
    matches.forEach(m => rows.push([
      m.id,
      m.homeTeam,
      m.awayTeam,
      m.homeScore,
      m.awayScore,
      fmtTime(m.timerSeconds),
      STATUS_LABELS[m.status] || m.status,
      m.events.length,
    ]));
    const content = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spelklar-matches-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin page" id="admin-dashboard">
      <div className="admin__inner">
        {/* Header */}
        <header className="admin__header">
          <div>
            <button className="admin__back btn-ghost" id="btn-admin-back" onClick={() => navigate('/')}>
              ← Back
            </button>
          </div>
          <div className="admin__heading-row">
            <h1 className="admin__title">Dashboard</h1>
            <button
              className="btn-primary admin__export-btn"
              id="btn-export-all"
              onClick={downloadAllCsv}
              disabled={matches.length === 0}
            >
              Export all CSV
            </button>
          </div>
          <p className="text-meta">{matches.length} match{matches.length !== 1 ? 'es' : ''} recorded this session</p>
        </header>

        {/* Matches table */}
        <div className="card admin__card">
          {loading ? (
            <p className="text-meta">Loading…</p>
          ) : matches.length === 0 ? (
            <div className="admin__empty">
              <p className="text-team" style={{ marginBottom: 'var(--space-sm)' }}>No matches yet</p>
              <p className="text-meta">Create a match to see it here.</p>
              <button className="btn-primary" id="btn-create-first" onClick={() => navigate('/')} style={{ marginTop: 'var(--space-lg)', maxWidth: 260 }}>
                Create a match
              </button>
            </div>
          ) : (
            <div className="admin__table-wrapper">
              <table className="admin__table" id="matches-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Match</th>
                    <th>Score</th>
                    <th>Duration</th>
                    <th>Events</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr
                      key={m.id}
                      className="admin__row"
                      onClick={() => navigate(`/match/${m.id}`)}
                      id={`match-row-${m.id}`}
                    >
                      <td className="admin__code">{m.id}</td>
                      <td>{m.homeTeam} vs {m.awayTeam}</td>
                      <td className="admin__score">{m.homeScore} – {m.awayScore}</td>
                      <td className="text-meta">{fmtTime(m.timerSeconds)}</td>
                      <td className="text-meta">{m.events.length}</td>
                      <td>
                        <span className={`admin__status-badge admin__status-badge--${m.status}`}>
                          {STATUS_LABELS[m.status] || m.status}
                        </span>
                      </td>
                      <td className="admin__arrow">→</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
