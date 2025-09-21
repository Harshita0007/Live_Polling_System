// middleware/auth.js
const socketService = require('../services/socketService');

// Middleware to validate socket connections
const validateSocketConnection = (socket, next) => {
  // You can add authentication logic here if needed
  // For this assignment, we'll keep it simple
  
  const { role, name } = socket.handshake.auth || {};
  
  if (!role || !['student', 'teacher'].includes(role)) {
    return next(new Error('Invalid role specified'));
  }

  if (role === 'student' && (!name || name.trim().length < 2)) {
    return next(new Error('Student name is required and must be at least 2 characters'));
  }

  socket.userRole = role;
  socket.userName = role === 'teacher' ? 'Teacher' : name;
  
  next();
};

// Middleware to check if user is teacher for certain actions
const requireTeacher = (socket, callback) => {
  const participant = socketService.participants?.get(socket.id);
  
  if (!participant || participant.role !== 'teacher') {
    socket.emit('error', { 
      message: 'Unauthorized: Teacher access required',
      code: 'TEACHER_REQUIRED'
    });
    return false;
  }
  
  return true;
};

// Middleware to check if user is student for certain actions
const requireStudent = (socket, callback) => {
  const participant = socketService.participants?.get(socket.id);
  
  if (!participant || participant.role !== 'student') {
    socket.emit('error', { 
      message: 'Unauthorized: Student access required',
      code: 'STUDENT_REQUIRED'
    });
    return false;
  }
  
  return true;
};

// Rate limiting middleware
const rateLimiter = (() => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 100; // per window

  return (socket, action) => {
    const key = `${socket.id}-${action}`;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + WINDOW_MS });
      return true;
    }
    
    const request = requests.get(key);
    
    if (now > request.resetTime) {
      request.count = 1;
      request.resetTime = now + WINDOW_MS;
      return true;
    }
    
    if (request.count >= MAX_REQUESTS) {
      socket.emit('error', { 
        message: 'Rate limit exceeded. Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
      return false;
    }
    
    request.count++;
    return true;
  };
})();

// Clean up rate limiter data periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, request] of rateLimiter.requests) {
    if (now > request.resetTime) {
      rateLimiter.requests.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes

module.exports = {
  validateSocketConnection,
  requireTeacher,
  requireStudent,
  rateLimiter
};