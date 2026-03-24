const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const matchRouter = require('./routes/match');
const authRouter = require('./routes/auth');
const teamsRouter = require('./routes/teams');
const clubsRouter = require('./routes/clubs');
const followsRouter = require('./routes/follows');

const app = express();
const server = http.createServer(app);

// Allow local dev + the deployed Vercel frontend
// Set FRONTEND_URL env var on Render to your Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'DELETE'] },
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check – visiting / in a browser confirms the server is up
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Spelklar API', version: '1.0.0' });
});

// Attach io to the match router so it can broadcast
matchRouter.setIo(io);
app.use('/api/match', matchRouter);
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/follows', followsRouter);

// Get all matches (admin)
app.get('/api/matches', async (req, res) => {
  const { getAllMatches } = require('./db');
  const matches = await getAllMatches();
  res.json(matches);
});

// Socket.io: authenticated connections
io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;

  // Join match room (public)
  socket.on('join:match', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('leave:match', (matchId) => {
    socket.leave(`match:${matchId}`);
  });

  // Join team rooms (for followed teams)
  socket.on('join:team', (teamId) => {
    if (userId) {
      socket.join(`team:${teamId}`);
    }
  });

  socket.on('leave:team', (teamId) => {
    if (userId) {
      socket.leave(`team:${teamId}`);
    }
  });

  // User-specific notifications
  socket.on('join:user', () => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
// Bind to 0.0.0.0 so Render can route external traffic in
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Spelklar server running on port ${PORT}`);
});
