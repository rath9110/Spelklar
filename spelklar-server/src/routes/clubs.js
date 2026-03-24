const express = require('express');
const router = express.Router();
const { prisma } = require('../db');
const { verifyAuth } = require('../middleware/auth');

// POST /api/clubs – create club
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    // Check slug is unique and URL-friendly
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ error: 'slug must be lowercase alphanumeric with hyphens' });
    }

    const club = await prisma.club.create({
      data: {
        name,
        slug,
      },
    });

    res.json(club);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'slug already exists' });
    }
    console.error('Error creating club:', err);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// GET /api/clubs/:id – club detail
router.get('/:id', async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id },
      include: {
        teams: {
          include: {
            _count: {
              select: { follows: true },
            },
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(club);
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// GET /api/clubs or GET /api/clubs?slug=xxx – all clubs or club by slug
router.get('/', async (req, res) => {
  try {
    const { slug } = req.query;

    // If slug provided, return specific club
    if (slug) {
      const club = await prisma.club.findUnique({
        where: { slug },
        include: {
          teams: {
            include: {
              _count: {
                select: { follows: true },
              },
            },
          },
        },
      });

      if (!club) {
        return res.status(404).json({ error: 'Club not found' });
      }

      return res.json(club);
    }

    // Otherwise return all clubs
    const clubs = await prisma.club.findMany({
      include: {
        teams: {
          include: {
            _count: {
              select: { follows: true },
            },
          },
        },
      },
    });

    res.json(clubs);
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

module.exports = router;
