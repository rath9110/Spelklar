// Database wrapper using Prisma
// Keeps the same function signatures as the old matchStore.js for backward compatibility
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// In-memory timer tracking (runtime state, not persisted)
const timers = {};

async function createMatch({ matchKey, homeTeam, awayTeam }) {
  const match = await prisma.match.create({
    data: {
      id: matchKey,
      homeScore: 0,
      awayScore: 0,
      timerSeconds: 0,
      status: 'pre',
      events: {
        create: [],
      },
    },
    include: {
      events: true,
    },
  });

  // Store team names in a way we can retrieve them
  // For backward compatibility, we'll add these as local properties
  match.homeTeam = homeTeam;
  match.awayTeam = awayTeam;
  match.timerRunning = false;

  return match;
}

async function getMatch(id) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!match) return null;

  // Add runtime state
  match.timerRunning = timers[id]?.running || false;
  return match;
}

async function getMatchSafe(id) {
  // Same as getMatch but removes sensitive runtime data
  return getMatch(id);
}

async function addEvent(id, event) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      events: true,
    },
  });

  if (!match) return null;

  // Create the event
  const newEvent = await prisma.matchEvent.create({
    data: {
      matchId: id,
      type: event.type,
      team: event.team || null,
      player: event.player || null,
      note: event.note || null,
      timerSeconds: event.timerSeconds,
    },
  });

  // Update score if it's a goal
  if (event.type === 'goal') {
    const scoreUpdate = event.team === 'home'
      ? { homeScore: { increment: 1 } }
      : { awayScore: { increment: 1 } };

    await prisma.match.update({
      where: { id },
      data: scoreUpdate,
    });
  }

  // Return updated match
  return getMatch(id);
}

async function undoLastEvent(id) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!match || match.events.length === 0) return null;

  const lastEvent = match.events[match.events.length - 1];

  // Reverse score if it was a goal
  if (lastEvent.type === 'goal') {
    const scoreUpdate = lastEvent.team === 'home'
      ? { homeScore: { decrement: 1 } }
      : { awayScore: { decrement: 1 } };

    await prisma.match.update({
      where: { id },
      data: scoreUpdate,
    });
  }

  // Delete the event
  await prisma.matchEvent.delete({
    where: { id: lastEvent.id },
  });

  // Return updated match
  return getMatch(id);
}

async function startTimer(id, onTick) {
  const match = await prisma.match.findUnique({
    where: { id },
  });

  if (!match || timers[id]?.running) return;

  // Mark as live in database
  await prisma.match.update({
    where: { id },
    data: { status: 'live' },
  });

  // Start the timer in memory
  timers[id] = { running: true };

  const interval = setInterval(async () => {
    // Increment timer
    const updated = await prisma.match.update({
      where: { id },
      data: { timerSeconds: { increment: 1 } },
      include: { events: true },
    });

    updated.timerRunning = true;
    onTick(updated);
  }, 1000);

  timers[id].interval = interval;
}

async function stopTimer(id) {
  if (!timers[id]) return;

  clearInterval(timers[id].interval);
  timers[id].running = false;

  // Mark as ended in database
  await prisma.match.update({
    where: { id },
    data: {
      status: 'ended',
      endedAt: new Date(),
    },
  });
}

async function getAllMatches() {
  const matches = await prisma.match.findMany({
    include: {
      events: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return matches.map((match) => ({
    ...match,
    timerRunning: timers[match.id]?.running || false,
  }));
}

// Cleanup on process exit
process.on('exit', async () => {
  await prisma.$disconnect();
});

module.exports = {
  createMatch,
  getMatch,
  getMatchSafe,
  addEvent,
  undoLastEvent,
  startTimer,
  stopTimer,
  getAllMatches,
  prisma, // Export prisma for advanced queries
};
