const express = require('express');
const router = express.Router();
const { prisma } = require('../db');
const { verifyAuth } = require('../middleware/auth');

// GET /api/teams?clubId=xxx – list teams in a club
router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query;

    if (!clubId) {
      return res.status(400).json({ error: 'clubId is required' });
    }

    const teams = await prisma.team.findMany({
      where: { clubId },
      include: {
        _count: {
          select: { follows: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:id – team detail
router.get('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        club: true,
        _count: {
          select: { follows: true },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/teams – create team (staff+)
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { name, clubId } = req.body;

    if (!name || !clubId) {
      return res.status(400).json({ error: 'name and clubId are required' });
    }

    // For MVP, allow anyone to create teams. Phase 2+ will check staff role.
    const team = await prisma.team.create({
      data: {
        name,
        clubId,
      },
      include: {
        club: true,
      },
    });

    res.json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

module.exports = router;
