const express = require('express');
const router = express.Router();
const { prisma } = require('../db');

// POST /api/seed – populate demo data
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.photoConsent.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.matchEvent.deleteMany();
    await prisma.match.deleteMany();
    await prisma.team.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    console.log('✓ Cleared existing data');

    // Create demo users
    const parentUser = await prisma.user.create({
      data: {
        phone: '+46701234567',
        displayName: 'Anna P.',
        role: 'visitor',
      },
    });

    const staffUser = await prisma.user.create({
      data: {
        phone: '+46702345678',
        displayName: 'Erik S.',
        role: 'staff',
      },
    });

    const grandparentUser = await prisma.user.create({
      data: {
        phone: '+46703456789',
        displayName: 'Göran B.',
        role: 'visitor',
      },
    });

    console.log('✓ Created 3 demo users');

    // Create clubs
    const aikClub = await prisma.club.create({
      data: {
        name: 'AIK Fotboll',
        slug: 'aik-fotboll',
      },
    });

    const hammarbySJ = await prisma.club.create({
      data: {
        name: 'Hammarby Sjöstad',
        slug: 'hammarby-sjostad',
      },
    });

    const solnaIK = await prisma.club.create({
      data: {
        name: 'Solna IK',
        slug: 'solna-ik',
      },
    });

    console.log('✓ Created 3 demo clubs');

    // Create teams
    const aikU12 = await prisma.team.create({
      data: {
        name: 'AIK U12 Blå',
        clubId: aikClub.id,
      },
    });

    const aikU12Gul = await prisma.team.create({
      data: {
        name: 'AIK U12 Gul',
        clubId: aikClub.id,
      },
    });

    const hammarbyU12 = await prisma.team.create({
      data: {
        name: 'Hammarby U12',
        clubId: hammarbySJ.id,
      },
    });

    const solnaU12 = await prisma.team.create({
      data: {
        name: 'Solna IK U12',
        clubId: solnaIK.id,
      },
    });

    console.log('✓ Created 4 demo teams');

    // Create 2 demo matches
    const demoMatch = await prisma.match.create({
      data: {
        matchId: 'DEMO01',
        homeTeam: 'AIK U12 Blå',
        awayTeam: 'Hammarby U12',
        homeTeamId: aikU12.id,
        awayTeamId: hammarbyU12.id,
        homeScore: 0,
        awayScore: 0,
        status: 'pre-game',
        timerSeconds: 0,
      },
    });

    const liveMatch = await prisma.match.create({
      data: {
        matchId: 'LIVE01',
        homeTeam: 'AIK U12 Blå',
        awayTeam: 'Hammarby U12',
        homeTeamId: aikU12.id,
        awayTeamId: hammarbyU12.id,
        homeScore: 2,
        awayScore: 1,
        status: 'live',
        timerSeconds: 1245,
      },
    });

    console.log('✓ Created 2 demo matches');

    // Create demo follows (Anna and Göran follow AIK U12 Blå)
    await prisma.follow.create({
      data: {
        userId: parentUser.id,
        teamId: aikU12.id,
      },
    });

    await prisma.follow.create({
      data: {
        userId: grandparentUser.id,
        teamId: aikU12.id,
      },
    });

    console.log('✓ Created 2 demo follows');

    res.json({
      success: true,
      message: '✅ Seed complete! Demo data ready.',
      data: {
        users: 3,
        clubs: 3,
        teams: 4,
        matches: 2,
        follows: 2,
      }
    });
  } catch (err) {
    console.error('Error seeding:', err);
    res.status(500).json({
      error: 'Failed to seed data',
      message: err.message
    });
  }
});

module.exports = router;
