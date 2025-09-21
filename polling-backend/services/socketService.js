// services/socketService.js (Backend)
const rooms = new Map();
const polls = new Map();
const timers = new Map();

class SocketService {
  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Room management
      socket.on('join_room', ({ roomId, userData }) => {
        socket.join(roomId);
        socket.userData = { ...userData, socketId: socket.id };
        socket.roomId = roomId;

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);
        room.set(socket.id, socket.userData);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', socket.userData);
        
        // Send current participants list to the joining user
        const participants = Array.from(room.values());
        socket.emit('participants_update', participants);
        
        console.log(`User ${userData.name} joined room ${roomId}`);
      });

      socket.on('leave_room', ({ roomId }) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Poll management
      socket.on('create_poll', (pollData) => {
        const { roomId } = pollData;
        polls.set(pollData.id, {
          ...pollData,
          responses: new Map(),
          createdBy: socket.id
        });

        // Broadcast poll to all users in the room
        this.io.to(roomId).emit('poll_created', pollData);

        // Start timer
        this.startPollTimer(pollData.id, pollData.timeLimit, roomId);
        
        console.log(`Poll created: ${pollData.question} in room ${roomId}`);
      });

      socket.on('submit_answer', ({ pollId, answer }) => {
        const poll = polls.get(pollId);
        if (poll && socket.userData) {
          // Store the user's response
          poll.responses.set(socket.id, {
            userId: socket.userData.id,
            userName: socket.userData.name,
            answer: answer,
            submittedAt: new Date()
          });

          // Update vote counts
          const option = poll.options.find(opt => opt.id === answer || opt.text === answer);
          if (option) {
            option.votes = (option.votes || 0) + 1;
          }

          console.log(`Answer submitted by ${socket.userData.name}: ${answer}`);
          
          // Optionally broadcast live results (uncomment if you want live updates)
          // const results = this.calculateResults(poll);
          // this.io.to(socket.roomId).emit('poll_results', results);
        }
      });

      socket.on('end_poll', ({ pollId }) => {
        const poll = polls.get(pollId);
        if (poll && poll.createdBy === socket.id) {
          // Clear timer
          this.clearPollTimer(pollId);
          
          // Calculate final results
          const results = this.calculateResults(poll);
          
          // Broadcast results to room
          this.io.to(socket.roomId).emit('poll_results', results);
          
          // Mark poll as ended and move to history
          setTimeout(() => {
            this.io.to(socket.roomId).emit('poll_ended', {
              ...poll,
              results: results,
              endedAt: new Date()
            });
            polls.delete(pollId);
          }, 5000); // Show results for 5 seconds
          
          console.log(`Poll ended: ${pollId}`);
        }
      });

      // Chat management
      socket.on('send_message', ({ roomId, message }) => {
        if (socket.userData) {
          const messageData = {
            ...message,
            id: message.id || this.generateId(),
            socketId: socket.id
          };
          
          // Broadcast message to all users in the room
          this.io.to(roomId).emit('message_received', messageData);
          
          console.log(`Message from ${socket.userData.name}: ${message.message}`);
        }
      });

      // User management (kicking)
      socket.on('kick_user', ({ roomId, userId }) => {
        const room = rooms.get(roomId);
        if (room && socket.userData && socket.userData.role === 'teacher') {
          // Find the socket to kick
          for (const [socketId, userData] of room.entries()) {
            if (userData.id === userId) {
              const socketToKick = this.io.sockets.sockets.get(socketId);
              if (socketToKick) {
                // Notify the user they've been kicked
                socketToKick.emit('user_kicked', { userId, reason: 'Kicked by teacher' });
                
                // Remove from room
                socketToKick.leave(roomId);
                room.delete(socketId);
                
                // Notify others
                socket.to(roomId).emit('user_left', userData);
                
                console.log(`User ${userData.name} was kicked from room ${roomId}`);
              }
              break;
            }
          }
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        if (socket.roomId) {
          this.handleLeaveRoom(socket, socket.roomId);
        }
        
        // Clean up any polls created by this user
        for (const [pollId, poll] of polls.entries()) {
          if (poll.createdBy === socket.id) {
            this.clearPollTimer(pollId);
            polls.delete(pollId);
          }
        }
      });
    });
  }

  handleLeaveRoom(socket, roomId) {
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const userData = room.get(socket.id);
      room.delete(socket.id);
      
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', userData);
      
      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(roomId);
      }
      
      console.log(`User ${userData.name} left room ${roomId}`);
    }
  }

  startPollTimer(pollId, duration, roomId) {
    let timeRemaining = duration;
    
    const timerId = setInterval(() => {
      timeRemaining--;
      
      // Broadcast time remaining
      this.io.to(roomId).emit('poll_timer', timeRemaining);
      
      if (timeRemaining <= 0) {
        // Time's up - end poll automatically
        const poll = polls.get(pollId);
        if (poll) {
          const results = this.calculateResults(poll);
          this.io.to(roomId).emit('poll_results', results);
          
          setTimeout(() => {
            this.io.to(roomId).emit('poll_ended', {
              ...poll,
              results: results,
              endedAt: new Date()
            });
            polls.delete(pollId);
          }, 5000);
        }
        
        clearInterval(timerId);
        timers.delete(pollId);
      }
    }, 1000);
    
    timers.set(pollId, timerId);
  }

  clearPollTimer(pollId) {
    const timerId = timers.get(pollId);
    if (timerId) {
      clearInterval(timerId);
      timers.delete(pollId);
    }
  }

  calculateResults(poll) {
    const results = {};
    poll.options.forEach(option => {
      results[option.text] = option.votes || 0;
    });
    return results;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Get room statistics
  getRoomStats(roomId) {
    const room = rooms.get(roomId);
    return {
      participantCount: room ? room.size : 0,
      activePolls: Array.from(polls.values()).filter(poll => poll.roomId === roomId).length
    };
  }
}

module.exports = new SocketService();