const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const matchRouter = require('./routes/match');
const authRouter = require('./routes/auth');

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

// Get all matches (admin)
app.get('/api/matches', async (req, res) => {
  const { getAllMatches } = require('./db');
  const matches = await getAllMatches();
  res.json(matches);
});

// Socket.io: clients join a room by matchId
io.on('connection', (socket) => {
  socket.on('join:match', (matchId) => {
    socket.join(matchId);
  });
  socket.on('leave:match', (matchId) => {
    socket.leave(matchId);
  });
});

const PORT = process.env.PORT || 3001;
// Bind to 0.0.0.0 so Render can route external traffic in
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Spelklar server running on port ${PORT}`);
});
