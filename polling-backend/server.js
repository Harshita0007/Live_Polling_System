// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pollRoutes = require('./routes/pollRoutes');
const apiRoutes = require('./routes/apiRoutes');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || ["http://localhost:3000", "https://your-frontend-url.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || ["http://localhost:3000", "https://your-frontend-url.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/polls', pollRoutes);
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Polling Server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket Service
socketService.initialize(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});