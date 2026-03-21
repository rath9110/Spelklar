import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, { autoConnect: false });

export const api = {
  async createMatch(homeTeam, awayTeam) {
    const res = await fetch(`${SERVER_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeTeam, awayTeam }),
    });
    return res.json();
  },

  async getMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}`);
    return res.json();
  },

  async startMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/start`, { method: 'POST' });
    return res.json();
  },

  async logEvent(id, type, team, note) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, team, note }),
    });
    return res.json();
  },

  async undoEvent(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/event`, { method: 'DELETE' });
    return res.json();
  },

  async endMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/end`, { method: 'POST' });
    return res.json();
  },

  async getAllMatches() {
    const res = await fetch(`${SERVER_URL}/api/matches`);
    return res.json();
  },
};
