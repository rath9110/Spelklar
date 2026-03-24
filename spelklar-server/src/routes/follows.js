const express = require('express');
const router = express.Router();
const { prisma } = require('../db');
const { verifyAuth } = require('../middleware/auth');

// GET /api/follows/mine – my followed teams (must be before /:teamId)
router.get('/mine', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const follows = await prisma.follow.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            club: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(follows.map(f => f.team));
  } catch (err) {
    console.error('Error fetching follows:', err);
    res.status(500).json({ error: 'Failed to fetch followed teams' });
  }
});

// GET /api/follows/mine/live – my followed teams with live matches
router.get('/mine/live', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const follows = await prisma.follow.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            club: true,
            homeMatches: {
              where: {
                status: 'live',
              },
              include: {
                awayTeam: true,
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            awayMatches: {
              where: {
                status: 'live',
              },
              include: {
                homeTeam: true,
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    // Flatten to show active matches
    const liveMatches = [];
    follows.forEach(f => {
      if (f.team.homeMatches.length > 0) {
        liveMatches.push({
          ...f.team.homeMatches[0],
          followedTeamId: f.team.id,
          followedTeamRole: 'home',
        });
      }
      if (f.team.awayMatches.length > 0) {
        liveMatches.push({
          ...f.team.awayMatches[0],
          followedTeamId: f.team.id,
          followedTeamRole: 'away',
        });
      }
    });

    res.json(liveMatches);
  } catch (err) {
    console.error('Error fetching live matches:', err);
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
});

// POST /api/follows – follow a team
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { teamId } = req.body;
    const userId = req.user.id;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    // Check team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already following this team' });
    }

    const follow = await prisma.follow.create({
      data: {
        userId,
        teamId,
      },
      include: {
        team: true,
      },
    });

    res.json(follow);
  } catch (err) {
    console.error('Error following team:', err);
    res.status(500).json({ error: 'Failed to follow team' });
  }
});

// DELETE /api/follows/:teamId – unfollow
router.delete('/:teamId', verifyAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const follow = await prisma.follow.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    if (!follow) {
      return res.status(404).json({ error: 'Not following this team' });
    }

    await prisma.follow.delete({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error unfollowing team:', err);
    res.status(500).json({ error: 'Failed to unfollow team' });
  }
});

module.exports = router;
