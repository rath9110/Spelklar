/**
 * Seed script to populate demo data
 * Run with: npm run seed
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding demo data...');

    // Clear existing data (be careful in production!)
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
    console.log(`  - Parent: +46701234567 (Anna P.)`);
    console.log(`  - Staff: +46702345678 (Erik S.)`);
    console.log(`  - Grandparent: +46703456789 (Göran B.)`);

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
        name: 'Solna U12',
        clubId: solnaIK.id,
      },
    });

    console.log('✓ Created 4 demo teams');

    // Create follows
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

    console.log('✓ Anna and Göran follow AIK U12 Blå');

    // Create a match (pre-game)
    const preMatch = await prisma.match.create({
      data: {
        id: 'DEMO01',
        homeTeamId: aikU12.id,
        awayTeamId: hammarbyU12.id,
        homeTeamName: 'AIK U12 Blå',
        awayTeamName: 'Hammarby U12',
        homeScore: 0,
        awayScore: 0,
        timerSeconds: 0,
        status: 'pre',
      },
    });

    console.log('✓ Created pre-game match: DEMO01 (AIK U12 Blå vs Hammarby U12)');

    // Create a live match with events
    const liveMatch = await prisma.match.create({
      data: {
        id: 'LIVE01',
        homeTeamId: aikU12Gul.id,
        awayTeamId: solnaU12.id,
        homeTeamName: 'AIK U12 Gul',
        awayTeamName: 'Solna U12',
        homeScore: 2,
        awayScore: 1,
        timerSeconds: 1847, // 30:47
        status: 'live',
        events: {
          create: [
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 340,
              timestamp: new Date(Date.now() - 5 * 60000),
            },
            {
              type: 'goal',
              team: 'away',
              timerSeconds: 680,
              timestamp: new Date(Date.now() - 3 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 1200,
              timestamp: new Date(Date.now() - 2 * 60000),
            },
            {
              type: 'sub',
              timerSeconds: 1500,
              timestamp: new Date(Date.now() - 1 * 60000),
            },
          ],
        },
      },
      include: { events: true },
    });

    console.log('✓ Created live match: LIVE01 (AIK U12 Gul 2-1 Solna U12)');
    console.log(`  - 4 events logged (2 goals for home, 1 for away, 1 sub)`);

    // Create demo photos
    const photo1 = await prisma.photo.create({
      data: {
        matchId: liveMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'photos/demo-photo-1.jpg',
        thumbnailKey: 'photos/demo-photo-1-thumb.jpg',
        caption: 'Great goal by Victor! ⚽',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(),
        consents: {
          create: {
            grantedBy: parentUser.id,
            scope: 'match',
          },
        },
      },
    });

    const photo2 = await prisma.photo.create({
      data: {
        matchId: liveMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'photos/demo-photo-2.jpg',
        thumbnailKey: 'photos/demo-photo-2-thumb.jpg',
        caption: 'Team celebration 🎉',
        status: 'pending',
        consents: {
          create: {
            grantedBy: parentUser.id,
            scope: 'match',
          },
        },
      },
    });

    const photo3 = await prisma.photo.create({
      data: {
        matchId: liveMatch.id,
        uploaderId: staffUser.id,
        storageKey: 'photos/demo-photo-3.jpg',
        thumbnailKey: 'photos/demo-photo-3-thumb.jpg',
        caption: 'Full team photo before kickoff',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 2 * 60000),
        consents: {
          create: {
            grantedBy: staffUser.id,
            scope: 'match',
          },
        },
      },
    });

    console.log('✓ Created 3 demo photos for live match');
    console.log(`  - 1 approved (Great goal)`);
    console.log(`  - 1 pending (Team celebration)`);
    console.log(`  - 1 approved (Team photo)`);

    console.log('\n✅ Seed complete! Demo data ready.\n');

    console.log('📋 Demo Data Summary:');
    console.log('─'.repeat(50));
    console.log('\n👥 Users (login with these phone numbers):');
    console.log(`   Parent:      +46701234567 (follows AIK U12 Blå)`);
    console.log(`   Staff:       +46702345678 (can moderate photos)`);
    console.log(`   Grandparent: +46703456789 (follows AIK U12 Blå)`);

    console.log('\n🏆 Clubs:');
    console.log(`   1. AIK Fotboll`);
    console.log(`   2. Hammarby Sjöstad`);
    console.log(`   3. Solna IK`);

    console.log('\n⚽ Teams:');
    console.log(`   1. AIK U12 Blå (followed by Anna & Göran)`);
    console.log(`   2. AIK U12 Gul`);
    console.log(`   3. Hammarby U12`);
    console.log(`   4. Solna U12`);

    console.log('\n🎮 Matches:');
    console.log(`   DEMO01: Pre-game (AIK U12 Blå vs Hammarby U12)`);
    console.log(`   LIVE01: 🔴 LIVE (AIK U12 Gul 2-1 Solna U12) ← HAS PHOTOS & EVENTS`);

    console.log('\n📷 Demo Photos (on LIVE01):');
    console.log(`   1. ✓ Approved: "Great goal by Victor!"`);
    console.log(`   2. ⏳ Pending: "Team celebration"`);
    console.log(`   3. ✓ Approved: "Full team photo"`);

    console.log('\n🔗 Quick Links:');
    console.log('─'.repeat(50));
    console.log(`   Login:           http://localhost:5173/login`);
    console.log(`   Pre-game feed:   http://localhost:5173/feed/DEMO01`);
    console.log(`   Live match feed: http://localhost:5173/feed/LIVE01`);
    console.log(`   My feed:         http://localhost:5173/feed`);
    console.log(`   Moderation:      http://localhost:5173/admin/photos`);
    console.log('\n💡 Try this:');
    console.log('   1. Login with +46701234567 (Anna)');
    console.log('   2. Go to /feed/LIVE01');
    console.log('   3. See live score, events, and photos');
    console.log('   4. Upload a photo (tap 📷)');
    console.log('   5. Login with +46702345678 (Erik) in another tab');
    console.log('   6. Go to /admin/photos to approve your photo');
    console.log('\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
