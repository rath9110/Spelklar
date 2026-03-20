const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {
  createMatch,
  getMatchSafe,
  addEvent,
  undoLastEvent,
  startTimer,
  stopTimer,
  getAllMatches,
} = require('../matchStore');

// Attach socket.io so routes can broadcast
let io;
router.setIo = (socketIo) => { io = socketIo; };

function broadcast(matchId, match) {
  if (io) {
    io.to(matchId).emit('match:update', match);
  }
}

// POST /api/match – create a new match
router.post('/', (req, res) => {
  const { homeTeam, awayTeam } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'homeTeam and awayTeam are required' });
  }
  // Generate a short 6-char match key
  const matchKey = uuidv4().slice(0, 6).toUpperCase();
  const match = createMatch({ matchKey, homeTeam, awayTeam });
  res.json({ matchKey, match: getMatchSafe(match.id) });
});

// GET /api/match/:id – get current match state
router.get('/:id', (req, res) => {
  const match = getMatchSafe(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json(match);
});

// POST /api/match/:id/start – start match timer
router.post('/:id/start', (req, res) => {
  const match = getMatchSafe(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  startTimer(req.params.id, (updatedMatch) => {
    broadcast(req.params.id, getMatchSafe(req.params.id));
  });

  const updated = getMatchSafe(req.params.id);
  broadcast(req.params.id, updated);
  res.json(updated);
});

// POST /api/match/:id/event – log an event
router.post('/:id/event', (req, res) => {
  const { type, team, player, note } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required' });

  const match = getMatchSafe(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  const event = {
    id: uuidv4(),
    type,         // goal | penalty | timeout | sub
    team,         // home | away
    player,
    note,
    timerSeconds: match.timerSeconds,
    timestamp: Date.now(),
  };

  const updated = addEvent(req.params.id, event);
  const safe = getMatchSafe(req.params.id);
  broadcast(req.params.id, safe);
  res.json(safe);
});

// DELETE /api/match/:id/event – undo last event
router.delete('/:id/event', (req, res) => {
  const updated = undoLastEvent(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Nothing to undo' });

  const safe = getMatchSafe(req.params.id);
  broadcast(req.params.id, safe);
  res.json(safe);
});

// POST /api/match/:id/end – end the match
router.post('/:id/end', (req, res) => {
  stopTimer(req.params.id);
  const safe = getMatchSafe(req.params.id);
  if (!safe) return res.status(404).json({ error: 'Match not found' });
  broadcast(req.params.id, safe);
  res.json(safe);
});

// GET /api/matches – admin: all matches
router.get('/', (req, res) => {
  res.json(getAllMatches());
});

module.exports = router;
