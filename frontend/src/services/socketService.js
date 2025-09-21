// src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = 'http://localhost:5000') {
    if (this.socket) {
      return this.socket;
    }

    console.log('Connecting to server:', serverUrl);

    this.socket = io(serverUrl, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling'],
      // Add retry configuration
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Connected to server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      console.error('🔴 Make sure your server is running on', serverUrl);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Room management
  joinRoom(roomId, userData) {
    if (this.socket && this.isConnected) {
      console.log('📡 Joining room:', roomId, 'with data:', userData);
      this.socket.emit('join_room', { roomId, userData });
    } else {
      console.error('❌ Cannot join room - socket not connected');
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      console.log('📡 Leaving room:', roomId);
      this.socket.emit('leave_room', { roomId });
    }
  }

  // Poll management
  createPoll(pollData) {
    if (this.socket && this.isConnected) {
      console.log('📡 Creating poll:', pollData);
      this.socket.emit('create_poll', pollData);
    } else {
      console.error('❌ Cannot create poll - socket not connected');
    }
  }

  submitAnswer(pollId, answer) {
    if (this.socket && this.isConnected) {
      console.log('📡 Submitting answer:', { pollId, answer });
      this.socket.emit('submit_answer', { pollId, answer });
    } else {
      console.error('❌ Cannot submit answer - socket not connected');
    }
  }

  endPoll(pollId) {
    if (this.socket && this.isConnected) {
      console.log('📡 Ending poll:', pollId);
      this.socket.emit('end_poll', { pollId });
    } else {
      console.error('❌ Cannot end poll - socket not connected');
    }
  }

  // Chat
  sendMessage(roomId, message) {
    if (this.socket && this.isConnected) {
      console.log('📡 Sending message to room:', roomId, message);
      this.socket.emit('send_message', { roomId, message });
    } else {
      console.error('❌ Cannot send message - socket not connected');
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Kick user
  kickUser(roomId, userId) {
    if (this.socket && this.isConnected) {
      console.log('📡 Kicking user:', userId, 'from room:', roomId);
      this.socket.emit('kick_user', { roomId, userId });
    } else {
      console.error('❌ Cannot kick user - socket not connected');
    }
  }

  // Helper methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }

  // Test connection
  testConnection() {
    if (this.socket && this.isConnected) {
      console.log('🧪 Testing connection...');
      this.socket.emit('ping', { timestamp: Date.now() });
      
      this.socket.once('pong', (data) => {
        console.log('🏓 Pong received:', data);
      });
    }
  }
}

export default new SocketService();