const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const matchRouter = require('./routes/match');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'DELETE'],
  },
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
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
server.listen(PORT, () => {
  console.log(`✅ Spelklar server running on http://localhost:${PORT}`);
});
