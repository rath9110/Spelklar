import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Get userId from localStorage (set after login)
const getUserId = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored).id : null;
  } catch {
    return null;
  }
};

export const socket = io(SERVER_URL, {
  autoConnect: false,
  auth: {
    userId: getUserId(),
  },
});

export const api = {
  async createMatch(homeTeam, awayTeam) {
    const res = await fetch(`${SERVER_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ homeTeam, awayTeam }),
    });
    return res.json();
  },

  async getMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}`, { credentials: 'include' });
    return res.json();
  },

  async startMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/start`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  async logEvent(id, type, team, note) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, team, note }),
    });
    return res.json();
  },

  async undoEvent(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/event`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async endMatch(id) {
    const res = await fetch(`${SERVER_URL}/api/match/${id}/end`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  async getAllMatches() {
    const res = await fetch(`${SERVER_URL}/api/matches`, { credentials: 'include' });
    return res.json();
  },

  // Teams
  async getTeams(clubId) {
    const res = await fetch(`${SERVER_URL}/api/teams?clubId=${clubId}`, { credentials: 'include' });
    return res.json();
  },

  async getTeam(id) {
    const res = await fetch(`${SERVER_URL}/api/teams/${id}`, { credentials: 'include' });
    return res.json();
  },

  async createTeam(name, clubId) {
    const res = await fetch(`${SERVER_URL}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, clubId }),
    });
    return res.json();
  },

  // Clubs
  async createClub(name, slug) {
    const res = await fetch(`${SERVER_URL}/api/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, slug }),
    });
    return res.json();
  },

  async getClub(id) {
    const res = await fetch(`${SERVER_URL}/api/clubs/${id}`, { credentials: 'include' });
    return res.json();
  },

  async getClubBySlug(slug) {
    const res = await fetch(`${SERVER_URL}/api/clubs?slug=${slug}`, { credentials: 'include' });
    return res.json();
  },

  // Follows
  async followTeam(teamId) {
    const res = await fetch(`${SERVER_URL}/api/follows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ teamId }),
    });
    return res.json();
  },

  async unfollowTeam(teamId) {
    const res = await fetch(`${SERVER_URL}/api/follows/${teamId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async getMyFollows() {
    const res = await fetch(`${SERVER_URL}/api/follows/mine`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getMyLiveMatches() {
    const res = await fetch(`${SERVER_URL}/api/follows/mine/live`, {
      credentials: 'include',
    });
    return res.json();
  },

  // Auth
  async getCurrentUser() {
    const res = await fetch(`${SERVER_URL}/api/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  },

  async logout() {
    const res = await fetch(`${SERVER_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  // Photos
  async getUploadUrl(matchId, contentType = 'image/jpeg') {
    const res = await fetch(`${SERVER_URL}/api/photos/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ matchId, contentType }),
    });
    return res.json();
  },

  async markUploadComplete(photoId) {
    const res = await fetch(`${SERVER_URL}/api/photos/${photoId}/uploaded`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  async getPhotos(matchId) {
    const res = await fetch(`${SERVER_URL}/api/photos?matchId=${matchId}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getPhoto(id) {
    const res = await fetch(`${SERVER_URL}/api/photos/${id}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async moderatePhoto(id, status) {
    const res = await fetch(`${SERVER_URL}/api/photos/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async deletePhoto(id) {
    const res = await fetch(`${SERVER_URL}/api/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async grantConsent(photoId, scope = 'match') {
    const res = await fetch(`${SERVER_URL}/api/photos/${photoId}/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ scope }),
    });
    return res.json();
  },

  async revokeConsent(photoId) {
    const res = await fetch(`${SERVER_URL}/api/photos/${photoId}/consent`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async getPendingPhotos() {
    const res = await fetch(`${SERVER_URL}/api/photos/moderate/pending`, {
      credentials: 'include',
    });
    return res.json();
  },
};
