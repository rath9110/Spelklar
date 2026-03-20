// In-memory match store – MVP, no database needed
const matches = {};

function createMatch({ matchKey, homeTeam, awayTeam }) {
  const id = matchKey;
  matches[id] = {
    id,
    homeTeam,
    awayTeam,
    homeScore: 0,
    awayScore: 0,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null,
    events: [],
    status: 'pre', // pre | live | ended
    createdAt: Date.now(),
  };
  return matches[id];
}

function getMatch(id) {
  return matches[id] || null;
}

function addEvent(id, event) {
  const match = matches[id];
  if (!match) return null;

  match.events.push(event);

  // Update score
  if (event.type === 'goal') {
    if (event.team === 'home') match.homeScore++;
    else match.awayScore++;
  }

  return match;
}

function undoLastEvent(id) {
  const match = matches[id];
  if (!match || match.events.length === 0) return null;

  const last = match.events[match.events.length - 1];

  // Reverse score if it was a goal
  if (last.type === 'goal') {
    if (last.team === 'home') match.homeScore = Math.max(0, match.homeScore - 1);
    else match.awayScore = Math.max(0, match.awayScore - 1);
  }

  match.events.pop();
  return match;
}

function startTimer(id, onTick) {
  const match = matches[id];
  if (!match || match.timerRunning) return;

  match.timerRunning = true;
  match.status = 'live';
  match.timerInterval = setInterval(() => {
    match.timerSeconds++;
    onTick(match);
  }, 1000);
}

function stopTimer(id) {
  const match = matches[id];
  if (!match) return;
  clearInterval(match.timerInterval);
  match.timerRunning = false;
  match.status = 'ended';
}

function getAllMatches() {
  return Object.values(matches).map(({ timerInterval, ...rest }) => rest);
}

function getMatchSafe(id) {
  const m = matches[id];
  if (!m) return null;
  const { timerInterval, ...rest } = m;
  return rest;
}

module.exports = { createMatch, getMatch, getMatchSafe, addEvent, undoLastEvent, startTimer, stopTimer, getAllMatches };
