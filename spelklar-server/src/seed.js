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

    const djurgardenClub = await prisma.club.create({
      data: {
        name: 'Djurgårdens IF',
        slug: 'djurgarden-if',
      },
    });

    const djurgardenU12 = await prisma.team.create({
      data: {
        name: 'Djurgården U12',
        clubId: djurgardenClub.id,
      },
    });

    console.log('✓ Created 5 demo teams');

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

    await prisma.follow.create({
      data: {
        userId: parentUser.id,
        teamId: djurgardenU12.id,
      },
    });

    console.log('✓ Anna and Göran follow AIK U12 Blå');
    console.log('✓ Anna follows Djurgården U12');

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

    // Create another live match that Anna follows (for feed demo)
    const feedMatch = await prisma.match.create({
      data: {
        id: 'FEED01',
        homeTeamId: aikU12.id,
        awayTeamId: hammarbyU12.id,
        homeTeamName: 'AIK U12 Blå',
        awayTeamName: 'Hammarby U12',
        homeScore: 3,
        awayScore: 1,
        timerSeconds: 2100, // 35:00
        status: 'live',
        events: {
          create: [
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 300,
              timestamp: new Date(Date.now() - 8 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 900,
              timestamp: new Date(Date.now() - 6 * 60000),
            },
            {
              type: 'goal',
              team: 'away',
              timerSeconds: 1200,
              timestamp: new Date(Date.now() - 4 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 1800,
              timestamp: new Date(Date.now() - 2 * 60000),
            },
          ],
        },
      },
      include: { events: true },
    });

    console.log('✓ Created live match: FEED01 (AIK U12 Blå 3-1 Hammarby U12)');
    console.log(`  - Anna and Göran follow this team!`);

    // Create another live match (Djurgården vs Hammarby)
    const djurgardenMatch = await prisma.match.create({
      data: {
        id: 'LIVE02',
        homeTeamId: djurgardenU12.id,
        awayTeamId: hammarbyU12.id,
        homeTeamName: 'Djurgården U12',
        awayTeamName: 'Hammarby U12',
        homeScore: 1,
        awayScore: 1,
        timerSeconds: 900, // 15:00
        status: 'live',
        events: {
          create: [
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 300,
              timestamp: new Date(Date.now() - 3 * 60000),
            },
            {
              type: 'goal',
              team: 'away',
              timerSeconds: 600,
              timestamp: new Date(Date.now() - 2 * 60000),
            },
          ],
        },
      },
      include: { events: true },
    });

    console.log('✓ Created live match: LIVE02 (Djurgården U12 1-1 Hammarby U12)');
    console.log(`  - Anna follows Djurgården!`);

    // Create an ended match (recent result)
    const endedMatch = await prisma.match.create({
      data: {
        id: 'ENDED01',
        homeTeamId: aikU12.id,
        awayTeamId: solnaU12.id,
        homeTeamName: 'AIK U12 Blå',
        awayTeamName: 'Solna U12',
        homeScore: 4,
        awayScore: 2,
        timerSeconds: 2700, // 45:00
        status: 'ended',
        endedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        events: {
          create: [
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 200,
              timestamp: new Date(Date.now() - 32 * 60000),
            },
            {
              type: 'goal',
              team: 'away',
              timerSeconds: 400,
              timestamp: new Date(Date.now() - 31 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 800,
              timestamp: new Date(Date.now() - 30 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 1400,
              timestamp: new Date(Date.now() - 29 * 60000),
            },
            {
              type: 'goal',
              team: 'away',
              timerSeconds: 2000,
              timestamp: new Date(Date.now() - 28 * 60000),
            },
            {
              type: 'goal',
              team: 'home',
              timerSeconds: 2400,
              timestamp: new Date(Date.now() - 27 * 60000),
            },
          ],
        },
      },
      include: { events: true },
    });

    console.log('✓ Created ended match: ENDED01 (AIK U12 Blå 4-2 Solna U12)');
    console.log(`  - Anna follows this team!`);

    // Create demo photos
    const photo1 = await prisma.photo.create({
      data: {
        matchId: liveMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'https://picsum.photos/seed/goal1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/goal1/400/300',
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
        storageKey: 'https://picsum.photos/seed/celebration1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/celebration1/400/300',
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
        storageKey: 'https://picsum.photos/seed/teamphoto1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/teamphoto1/400/300',
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

    console.log('✓ Created 3 demo photos for LIVE01');
    console.log(`  - 1 approved (Great goal)`);
    console.log(`  - 1 pending (Team celebration)`);
    console.log(`  - 1 approved (Team photo)`);

    // Add photos to FEED01 (the match Anna follows)
    const feedPhoto1 = await prisma.photo.create({
      data: {
        matchId: feedMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'https://picsum.photos/seed/assist1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/assist1/400/300',
        caption: 'Beautiful assist by Maja! 🎯',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 7 * 60000),
        consents: {
          create: {
            grantedBy: parentUser.id,
            scope: 'match',
          },
        },
      },
    });

    const feedPhoto2 = await prisma.photo.create({
      data: {
        matchId: feedMatch.id,
        uploaderId: grandparentUser.id,
        storageKey: 'https://picsum.photos/seed/striker1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/striker1/400/300',
        caption: 'Linus scoring again! Top striker! ⚽⚽',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 5 * 60000),
        consents: {
          create: {
            grantedBy: grandparentUser.id,
            scope: 'match',
          },
        },
      },
    });

    console.log('✓ Created 2 demo photos for FEED01 (Anna and Göran follow this match)');

    // Add photos to LIVE02 (Djurgården match - Anna follows)
    const live2Photo1 = await prisma.photo.create({
      data: {
        matchId: djurgardenMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'https://picsum.photos/seed/djurgarden1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/djurgarden1/400/300',
        caption: 'Vacker målchans! 🔥',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 2 * 60000),
        consents: {
          create: {
            grantedBy: parentUser.id,
            scope: 'match',
          },
        },
      },
    });

    const live2Photo2 = await prisma.photo.create({
      data: {
        matchId: djurgardenMatch.id,
        uploaderId: grandparentUser.id,
        storageKey: 'https://picsum.photos/seed/djurgarden2/800/600',
        thumbnailKey: 'https://picsum.photos/seed/djurgarden2/400/300',
        caption: 'Spännande match!',
        status: 'pending',
        consents: {
          create: {
            grantedBy: grandparentUser.id,
            scope: 'match',
          },
        },
      },
    });

    console.log('✓ Created 2 demo photos for LIVE02');

    // Add photos to ENDED01 (Recent result - Anna follows)
    const ended1Photo1 = await prisma.photo.create({
      data: {
        matchId: endedMatch.id,
        uploaderId: parentUser.id,
        storageKey: 'https://picsum.photos/seed/ended1/800/600',
        thumbnailKey: 'https://picsum.photos/seed/ended1/400/300',
        caption: 'Tre mål av vår starkaste spelare! 🌟',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 20 * 60000),
        consents: {
          create: {
            grantedBy: parentUser.id,
            scope: 'match',
          },
        },
      },
    });

    const ended1Photo2 = await prisma.photo.create({
      data: {
        matchId: endedMatch.id,
        uploaderId: grandparentUser.id,
        storageKey: 'https://picsum.photos/seed/ended2/800/600',
        thumbnailKey: 'https://picsum.photos/seed/ended2/400/300',
        caption: 'Strålande insats av hela laget! 👏',
        status: 'approved',
        moderatedBy: staffUser.id,
        moderatedAt: new Date(Date.now() - 18 * 60000),
        consents: {
          create: {
            grantedBy: grandparentUser.id,
            scope: 'match',
          },
        },
      },
    });

    console.log('✓ Created 2 demo photos for ENDED01');

    console.log('\n✅ Seed complete! Demo data ready.\n');

    console.log('📋 Demo Data Summary:');
    console.log('─'.repeat(50));
    console.log('\n👥 Users (login with these phone numbers):');
    console.log(`   Parent:      +46701234567 (follows AIK U12 Blå & Djurgården U12)`);
    console.log(`   Staff:       +46702345678 (can moderate photos)`);
    console.log(`   Grandparent: +46703456789 (follows AIK U12 Blå)`);

    console.log('\n🏆 Clubs:');
    console.log(`   1. AIK Fotboll`);
    console.log(`   2. Hammarby Sjöstad`);
    console.log(`   3. Solna IK`);
    console.log(`   4. Djurgårdens IF`);

    console.log('\n⚽ Teams:');
    console.log(`   1. AIK U12 Blå (followed by Anna & Göran)`);
    console.log(`   2. AIK U12 Gul`);
    console.log(`   3. Hammarby U12`);
    console.log(`   4. Solna U12`);
    console.log(`   5. Djurgården U12 (followed by Anna)`);

    console.log('\n🎮 Matches:');
    console.log(`   DEMO01:  Pre-game (AIK U12 Blå vs Hammarby U12)`);
    console.log(`   LIVE01:  🔴 LIVE (AIK U12 Gul 2-1 Solna U12)`);
    console.log(`   FEED01:  🔴 LIVE (AIK U12 Blå 3-1 Hammarby U12) ← Anna & Göran follow!`);
    console.log(`   LIVE02:  🔴 LIVE (Djurgården U12 1-1 Hammarby U12) ← Anna follows!`);
    console.log(`   ENDED01: ✓ ENDED (AIK U12 Blå 4-2 Solna U12) ← Anna follows!`);

    console.log('\n📷 Demo Photos:');
    console.log(`   LIVE01:`);
    console.log(`     1. ✓ Approved: "Great goal by Victor!"`);
    console.log(`     2. ⏳ Pending: "Team celebration"`);
    console.log(`     3. ✓ Approved: "Full team photo"`);
    console.log(`   FEED01 (Anna's follow):`);
    console.log(`     1. ✓ Approved: "Beautiful assist by Maja!"`);
    console.log(`     2. ✓ Approved: "Linus scoring again!"`);
    console.log(`   LIVE02 (Anna's follow):`);
    console.log(`     1. ✓ Approved: "Vacker målchans!"`);
    console.log(`     2. ⏳ Pending: "Spännande match!"`);
    console.log(`   ENDED01 (Anna's follow):`);
    console.log(`     1. ✓ Approved: "Tre mål av vår starkaste spelare!"`);
    console.log(`     2. ✓ Approved: "Strålande insats av hela laget!"`);

    console.log('\n🔗 Quick Links (local):');
    console.log('─'.repeat(50));
    console.log(`   Login:           http://localhost:5173/login`);
    console.log(`   Anna's feed:     http://localhost:5173/feed (shows FEED01)`);
    console.log(`   FEED01 match:    http://localhost:5173/feed/FEED01`);
    console.log(`   LIVE01 match:    http://localhost:5173/feed/LIVE01`);
    console.log(`   Moderation:      http://localhost:5173/admin/photos`);
    console.log(`\n🔗 Quick Links (production):`)
    console.log('─'.repeat(50));
    console.log(`   Login:           https://spelklar.vercel.app/login`);
    console.log(`   Anna's feed:     https://spelklar.vercel.app/feed`);
    console.log(`   FEED01 match:    https://spelklar.vercel.app/feed/FEED01`);
    console.log(`\n💡 Try this as Anna (+46701234567):`);
    console.log('   1. Go to /feed (see FEED01 live match)');
    console.log('   2. See live score 3-1, events, and 2 photos');
    console.log('   3. Click match to see full feed');
    console.log('   4. Upload a photo (tap 📷 FAB)');
    console.log('   5. Login as Erik (+46702345678) to moderate in /admin/photos');
    console.log('\n');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
