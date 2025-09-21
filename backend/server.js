const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// In-memory storage (replace with database in production)
let currentPoll = null;
let pollHistory = [];
let connectedUsers = new Map();
let responses = new Map(); // pollId -> { userId: answer }
let chatMessages = [];

// Utility functions
const generatePollId = () => Date.now().toString();

const calculateResults = (pollId) => {
  const pollResponses = responses.get(pollId) || {};
  const totalResponses = Object.keys(pollResponses).length;
  
  if (!currentPoll || totalResponses === 0) {
    return { results: {}, totalResponses: 0, totalUsers: connectedUsers.size };
  }

  const results = {};
  currentPoll.options.forEach(option => {
    results[option] = { votes: 0, percentage: 0 };
  });

  Object.values(pollResponses).forEach(answer => {
    if (results[answer]) {
      results[answer].votes++;
    }
  });

  Object.keys(results).forEach(option => {
    results[option].percentage = totalResponses > 0 
      ? Math.round((results[option].votes / totalResponses) * 100) 
      : 0;
  });

  return { 
    results, 
    totalResponses, 
    totalUsers: connectedUsers.size,
    allAnswered: totalResponses === connectedUsers.size - 1 // Excluding teacher
  };
};

// API Routes
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/current-poll', (req, res) => {
  console.log('Current poll requested');
  res.json({ 
    poll: currentPoll, 
    results: currentPoll ? calculateResults(currentPoll.id) : null 
  });
});

app.get('/api/poll-history', (req, res) => {
  console.log(`Poll history requested - ${pollHistory.length} polls in history`);
  res.json({ history: pollHistory });
});

app.delete('/api/poll-history', (req, res) => {
  console.log(`🗑️  Clearing poll history - ${pollHistory.length} polls to be removed`);
  pollHistory.length = 0; // Clear the array
  console.log('✅ Poll history cleared successfully');
  res.json({ success: true, message: 'Poll history cleared successfully' });
});

app.post('/api/polls', (req, res) => {
  const { question, options, timeLimit = 60 } = req.body;
  
  console.log(`\n📊 CREATING NEW POLL:`);
  console.log(`   Question: "${question}"`);
  console.log(`   Options: [${options.join(', ')}]`);
  console.log(`   Time Limit: ${timeLimit} seconds`);
  
  if (!question || !options || options.length < 2) {
    console.log('❌ Poll creation failed: Invalid data');
    return res.status(400).json({ error: 'Question and at least 2 options are required' });
  }

  // Check if we can create a new poll
  if (currentPoll && currentPoll.isActive) {
    const results = calculateResults(currentPoll.id);
    const hasStudents = connectedUsers.size > 1; // More than just the teacher
    
    if (hasStudents && !results.allAnswered) {
      console.log('❌ Poll creation failed: Previous poll still active - students still answering');
      return res.status(400).json({ 
        error: 'Cannot create new poll. Wait for all students to answer the current question.' 
      });
    } else if (!hasStudents) {
      console.log('⚠️  No students connected - ending previous poll automatically');
      currentPoll.isActive = false;
      // Save to history
      pollHistory.push({
        ...currentPoll,
        results: results.results,
        totalResponses: results.totalResponses
      });
    }
  }

  const pollId = generatePollId();
  currentPoll = {
    id: pollId,
    question,
    options,
    timeLimit,
    createdAt: new Date(),
    startTime: Date.now(),
    expiresAt: new Date(Date.now() + timeLimit * 1000),
    isActive: true
  };

  responses.set(pollId, {});

  console.log(`✅ Poll created successfully - ID: ${pollId}`);
  console.log(`📤 Broadcasting to ${connectedUsers.size} connected users`);

  // Notify all connected clients
  io.emit('new-poll', currentPoll);

  // Auto-close poll after time limit
  setTimeout(() => {
    if (currentPoll && currentPoll.id === pollId) {
      currentPoll.isActive = false;
      const finalResults = calculateResults(pollId);
      
      console.log(`⏰ Poll ${pollId} auto-expired after ${timeLimit}s`);
      console.log(`📊 Final results: ${finalResults.totalResponses} responses`);
      
      // Save to history
      pollHistory.push({
        ...currentPoll,
        results: finalResults.results,
        totalResponses: finalResults.totalResponses
      });

      io.emit('poll-ended', { pollId, results: finalResults });
    }
  }, timeLimit * 1000);

  res.json({ success: true, poll: currentPoll });
});

app.post('/api/polls/:pollId/answer', (req, res) => {
  const { pollId } = req.params;
  const { answer, userId } = req.body;

  console.log(`📝 Answer submission: User ${userId} voted "${answer}" for poll ${pollId}`);

  if (!currentPoll || currentPoll.id !== pollId) {
    console.log('❌ Answer rejected: Poll not found or expired');
    return res.status(404).json({ error: 'Poll not found or expired' });
  }

  if (!currentPoll.isActive) {
    console.log('❌ Answer rejected: Poll has ended');
    return res.status(400).json({ error: 'Poll has ended' });
  }

  if (!currentPoll.options.includes(answer)) {
    console.log(`❌ Answer rejected: Invalid option "${answer}"`);
    return res.status(400).json({ error: 'Invalid answer option' });
  }

  // Store the response
  const pollResponses = responses.get(pollId) || {};
  pollResponses[userId] = answer;
  responses.set(pollId, pollResponses);

  const results = calculateResults(pollId);
  
  console.log(`✅ Answer accepted: ${results.totalResponses}/${results.totalUsers - 1} students answered`);

  // Broadcast updated results
  io.emit('poll-results-updated', results);

  // Check if all students have answered
  if (results.allAnswered) {
    currentPoll.isActive = false;
    console.log(`🎯 All students answered! Poll ${pollId} completed`);
    pollHistory.push({
      ...currentPoll,
      results: results.results,
      totalResponses: results.totalResponses
    });
    io.emit('poll-ended', { pollId, results });
  }

  res.json({ success: true, results });
});

app.post('/api/kick-user', (req, res) => {
  const { userId } = req.body;
  
  console.log(`👢 Attempting to kick user: ${userId}`);
  
  if (connectedUsers.has(userId)) {
    const user = connectedUsers.get(userId);
    const socketId = user.socketId;
    console.log(`✅ Kicking user "${user.name}" (${user.role})`);
    
    io.to(socketId).emit('user-kicked');
    connectedUsers.delete(userId);
    
    // Update user count for all clients
    io.emit('user-count-updated', connectedUsers.size);
    
    res.json({ success: true });
  } else {
    console.log('❌ Kick failed: User not found');
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/connected-users', (req, res) => {
  const users = Array.from(connectedUsers.values()).map(user => ({
    id: user.id,
    name: user.name,
    role: user.role,
    joinedAt: user.joinedAt
  }));
  console.log(`👥 Connected users requested: ${users.length} users`);
  res.json({ users, count: users.length });
});

// Chat endpoints
app.get('/api/chat/messages', (req, res) => {
  console.log(`💬 Chat messages requested: ${chatMessages.length} messages`);
  res.json({ messages: chatMessages });
});

app.post('/api/chat/messages', (req, res) => {
  const { message, userId, userName } = req.body;
  
  console.log(`💬 New chat message from ${userName}: "${message}"`);
  
  const chatMessage = {
    id: Date.now().toString(),
    message,
    userId,
    userName,
    timestamp: new Date()
  };
  
  chatMessages.push(chatMessage);
  
  // Keep only last 100 messages
  if (chatMessages.length > 100) {
    chatMessages = chatMessages.slice(-100);
  }
  
  io.emit('new-chat-message', chatMessage);
  res.json({ success: true, message: chatMessage });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n🔗 NEW SOCKET CONNECTION:`);
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Time: ${timestamp}`);
  console.log(`   Total connections: ${io.engine.clientsCount}`);

  socket.on('user-join', (userData) => {
    const { name, role } = userData;
    
    // Check if this socket already has a user
    if (socket.userId) {
      console.log(`\n⚠️  USER ALREADY JOINED:`);
      console.log(`   Socket ID: ${socket.id}`);
      console.log(`   Existing User ID: ${socket.userId}`);
      return;
    }
    
    const userId = `${role}_${name}_${Date.now()}`;
    
    connectedUsers.set(userId, {
      id: userId,
      name,
      role,
      socketId: socket.id,
      joinedAt: new Date()
    });

    socket.userId = userId;
    
    console.log(`\n👤 USER JOINED:`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role.toUpperCase()}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Total users: ${connectedUsers.size}`);
    
    // Check if there's an active poll and if student can join
    let pollToSend = null;
    if (currentPoll && currentPoll.isActive) {
      // Check if poll is still valid (not expired)
      const now = Date.now();
      const pollStartTime = currentPoll.startTime;
      const pollDuration = currentPoll.timeLimit * 1000; // Convert to milliseconds
      
      // If no startTime, assume poll is still valid (newly created)
      if (!pollStartTime) {
        console.log(`📊 Poll ${currentPoll.id} has no startTime, assuming valid`);
        pollToSend = currentPoll;
      } else if (now - pollStartTime < pollDuration) {
        console.log(`📊 Poll ${currentPoll.id} is still valid`);
        pollToSend = currentPoll;
      } else {
        console.log(`⏰ Poll ${currentPoll.id} has expired, marking as inactive`);
        currentPoll.isActive = false;
        // Save to history
        const finalResults = calculateResults(currentPoll.id);
        pollHistory.push({
          ...currentPoll,
          results: finalResults.results,
          totalResponses: finalResults.totalResponses
        });
        io.emit('poll-ended', { pollId: currentPoll.id, results: finalResults });
      }
    }

    // Send current state to newly connected user
    socket.emit('user-joined', { 
      userId,
      currentPoll: pollToSend, 
      results: pollToSend ? calculateResults(pollToSend.id) : null 
    });

    // Update user count for all clients
    io.emit('user-count-updated', {
      count: connectedUsers.size,
      users: Array.from(connectedUsers.values()).map(user => ({
        id: user.id,
        name: user.name,
        role: user.role
      }))
    });
  });

  socket.on('submit-answer', (data) => {
    const { answer } = data;
    const user = Array.from(connectedUsers.values()).find(u => u.socketId === socket.id);
    
    if (!user) {
      console.log('❌ Answer rejected: User not found');
      return;
    }
    
    if (!currentPoll || !currentPoll.isActive) {
      console.log('❌ Answer rejected: No active poll');
      return;
    }

    console.log(`\n📝 SOCKET ANSWER:`);
    console.log(`   User: ${user.name} (${user.role})`);
    console.log(`   Answer: "${answer}"`);
    console.log(`   Poll: ${currentPoll.question}`);

    // Store the response
    const pollResponses = responses.get(currentPoll.id) || {};
    pollResponses[user.id] = answer;
    responses.set(currentPoll.id, pollResponses);

    const results = calculateResults(currentPoll.id);
    
    console.log(`   Progress: ${results.totalResponses}/${results.totalUsers - 1} answered`);

    // Broadcast updated results
    io.emit('poll-results-updated', results);

    // Check if all students have answered
    if (results.allAnswered) {
      currentPoll.isActive = false;
      console.log(`🎯 POLL COMPLETED! All students answered`);
      pollHistory.push({
        ...currentPoll,
        results: results.results,
        totalResponses: results.totalResponses
      });
      io.emit('poll-ended', { pollId: currentPoll.id, results });
    }
  });

  socket.on('send-chat-message', (data) => {
    const { message } = data;
    const user = Array.from(connectedUsers.values()).find(u => u.socketId === socket.id);
    
    if (!user) {
      console.log('❌ Chat message rejected: User not found');
      return;
    }

    console.log(`\n💬 SOCKET CHAT MESSAGE:`);
    console.log(`   From: ${user.name} (${user.role})`);
    console.log(`   Message: "${message}"`);

    const chatMessage = {
      id: Date.now().toString(),
      message,
      userId: user.id,
      userName: user.name,
      role: user.role,
      timestamp: new Date()
    };
    
    chatMessages.push(chatMessage);
    
    // Keep only last 100 messages
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }
    
    io.emit('new-chat-message', chatMessage);
  });

  socket.on('disconnect', () => {
    console.log(`\n❌ SOCKET DISCONNECTED:`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   Time: ${new Date().toLocaleTimeString()}`);
    
    // Find and remove the user
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`   User: ${userData.name} (${userData.role})`);
        console.log(`   Remaining users: ${connectedUsers.size}`);
        break;
      }
    }
    
    // Update user count for all clients
    io.emit('user-count-updated', {
      count: connectedUsers.size,
      users: Array.from(connectedUsers.values()).map(user => ({
        id: user.id,
        name: user.name,
        role: user.role
      }))
    });
  });
});

// Add heartbeat to show server is alive
setInterval(() => {
  const timestamp = new Date().toLocaleTimeString();
  const activeUsers = connectedUsers.size;
  const activePoll = currentPoll ? 'Active' : 'None';
  console.log(`\n💓 SERVER HEARTBEAT [${timestamp}]`);
  console.log(`   Connected Users: ${activeUsers}`);
  console.log(`   Active Poll: ${activePoll}`);
  console.log(`   Poll History: ${pollHistory.length} polls`);
  console.log(`   Chat Messages: ${chatMessages.length} messages`);
}, 30000); // Every 30 seconds

// Error handling
process.on('uncaughtException', (error) => {
  console.error('\n🚨 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('\n🚨 UNHANDLED REJECTION:', error);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🚀 LIVE POLLING SYSTEM SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`   Port: ${PORT}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('\n✅ Server is ready and waiting for connections...\n');
});

module.exports = { app, server, io };