const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const matchRouter = require('./routes/match');

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

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Attach io to the match router so it can broadcast
matchRouter.setIo(io);
app.use('/api/match', matchRouter);

// Get all matches (admin)
app.get('/api/matches', (req, res) => {
  const { getAllMatches } = require('./matchStore');
  res.json(getAllMatches());
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
