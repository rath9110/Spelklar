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
} = require('../db');

// Attach socket.io so routes can broadcast
let io;
router.setIo = (socketIo) => { io = socketIo; };

function broadcast(matchId, match) {
  if (io) {
    io.to(matchId).emit('match:update', match);
  }
}

// POST /api/match – create a new match
router.post('/', async (req, res) => {
  try {
    const { homeTeam, awayTeam } = req.body;
    if (!homeTeam || !awayTeam) {
      return res.status(400).json({ error: 'homeTeam and awayTeam are required' });
    }
    // Generate a short 6-char match key
    const matchKey = uuidv4().slice(0, 6).toUpperCase();
    const match = await createMatch({ matchKey, homeTeam, awayTeam });
    const safe = await getMatchSafe(match.id);
    res.json({ matchKey, match: safe });
  } catch (err) {
    console.error('Error creating match:', err);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// GET /api/match/:id – get current match state
router.get('/:id', async (req, res) => {
  try {
    const match = await getMatchSafe(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    console.error('Error fetching match:', err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// POST /api/match/:id/start – start match timer
router.post('/:id/start', async (req, res) => {
  try {
    const match = await getMatchSafe(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    await startTimer(req.params.id, (updatedMatch) => {
      broadcast(req.params.id, updatedMatch);
    });

    const updated = await getMatchSafe(req.params.id);
    broadcast(req.params.id, updated);
    res.json(updated);
  } catch (err) {
    console.error('Error starting timer:', err);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// POST /api/match/:id/event – log an event
router.post('/:id/event', async (req, res) => {
  try {
    const { type, team, player, note } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });

    const match = await getMatchSafe(req.params.id);
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

    const updated = await addEvent(req.params.id, event);
    const safe = await getMatchSafe(req.params.id);
    broadcast(req.params.id, safe);
    res.json(safe);
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

// DELETE /api/match/:id/event – undo last event
router.delete('/:id/event', async (req, res) => {
  try {
    const updated = await undoLastEvent(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Nothing to undo' });

    const safe = await getMatchSafe(req.params.id);
    broadcast(req.params.id, safe);
    res.json(safe);
  } catch (err) {
    console.error('Error undoing event:', err);
    res.status(500).json({ error: 'Failed to undo event' });
  }
});

// POST /api/match/:id/end – end the match
router.post('/:id/end', async (req, res) => {
  try {
    await stopTimer(req.params.id);
    const safe = await getMatchSafe(req.params.id);
    if (!safe) return res.status(404).json({ error: 'Match not found' });
    broadcast(req.params.id, safe);
    res.json(safe);
  } catch (err) {
    console.error('Error ending match:', err);
    res.status(500).json({ error: 'Failed to end match' });
  }
});

// GET /api/matches – admin: all matches
router.get('/', async (req, res) => {
  try {
    const matches = await getAllMatches();
    res.json(matches);
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

module.exports = router;
