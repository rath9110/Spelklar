import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './EnterCode.css';

export default function EnterCode() {
  const [step, setStep] = useState('home'); // home | join | create
  const [matchKey, setMatchKey] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!matchKey.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getMatch(matchKey.trim().toUpperCase());
      if (data.error) { setError('Match not found. Check your code.'); return; }
      navigate(`/match/${data.id}`);
    } catch {
      setError('Could not connect. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.createMatch(homeTeam.trim(), awayTeam.trim());
      navigate(`/match/${data.matchKey}`);
    } catch {
      setError('Could not create match. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enter-code page" id="enter-code-page">
      <div className="enter-code__inner">
        {/* Logo / brand */}
        <div className="enter-code__brand">
          <div className="enter-code__logo">
            <span>S</span>
          </div>
          <h1 className="enter-code__title">Spelklar</h1>
          <p className="enter-code__sub text-meta">Match protocol built for humans</p>
        </div>

        {step === 'home' && (
          <div className="enter-code__actions" style={{ animationName: 'fade-in' }}>
            <button
              className="btn-primary"
              id="btn-new-match"
              onClick={() => setStep('create')}
            >
              New match
            </button>
            <button
              className="btn-ghost"
              id="btn-join-match"
              onClick={() => setStep('join')}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              Join with match code
            </button>
            <button
              className="btn-ghost"
              id="btn-admin"
              onClick={() => navigate('/admin')}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              Admin dashboard →
            </button>
          </div>
        )}

        {step === 'join' && (
          <form onSubmit={handleJoin} className="enter-code__form" id="join-form">
            <label className="enter-code__label">Match code</label>
            <input
              className="input"
              id="match-code-input"
              type="text"
              placeholder="e.g. ABC123"
              value={matchKey}
              onChange={(e) => setMatchKey(e.target.value.toUpperCase())}
              autoFocus
              maxLength={6}
              style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontSize: 24 }}
            />
            {error && <p className="enter-code__error">{error}</p>}
            <button className="btn-primary" type="submit" id="btn-join-submit" disabled={loading}>
              {loading ? 'Joining…' : 'Join match'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep('home')} style={{ marginTop: 'var(--space-sm)' }}>
              Back
            </button>
          </form>
        )}

        {step === 'create' && (
          <form onSubmit={handleCreate} className="enter-code__form" id="create-form">
            <label className="enter-code__label">Home team</label>
            <input
              className="input"
              id="home-team-input"
              type="text"
              placeholder="e.g. AIK"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              autoFocus
            />
            <label className="enter-code__label" style={{ marginTop: 'var(--space-sm)' }}>Away team</label>
            <input
              className="input"
              id="away-team-input"
              type="text"
              placeholder="e.g. Hammarby"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
            />
            {error && <p className="enter-code__error">{error}</p>}
            <button className="btn-primary" type="submit" id="btn-create-submit" disabled={loading} style={{ marginTop: 'var(--space-md)' }}>
              {loading ? 'Creating…' : 'Create match'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep('home')} style={{ marginTop: 'var(--space-sm)' }}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
