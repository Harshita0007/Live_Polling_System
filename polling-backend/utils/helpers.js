// utils/helpers.js
const { v4: uuidv4 } = require('uuid');

// Generate unique ID
const generateId = () => {
  return uuidv4();
};

// Generate short ID (for room codes, etc.)
const generateShortId = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format time remaining in MM:SS format
const formatTimeRemaining = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Validate poll data
const validatePollData = (pollData) => {
  const errors = [];

  if (!pollData.question || pollData.question.trim().length < 5) {
    errors.push('Question must be at least 5 characters long');
  }

  if (!pollData.options || !Array.isArray(pollData.options) || pollData.options.length < 2) {
    errors.push('At least 2 options are required');
  }

  if (pollData.options && pollData.options.length > 10) {
    errors.push('Maximum 10 options allowed');
  }

  if (pollData.options) {
    pollData.options.forEach((option, index) => {
      if (!option.text || option.text.trim().length < 1) {
        errors.push(`Option ${index + 1} cannot be empty`);
      }
    });
  }

  if (pollData.timeLimit && (pollData.timeLimit < 10 || pollData.timeLimit > 300)) {
    errors.push('Time limit must be between 10 and 300 seconds');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate student name
const validateStudentName = (name) => {
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (trimmedName.length > 50) {
      errors.push('Name must not exceed 50 characters');
    }
    
    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    const validNameRegex = /^[a-zA-Z0-9\s\-_.]+$/;
    if (!validNameRegex.test(trimmedName)) {
      errors.push('Name contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName: name ? name.trim() : ''
  };
};

// Validate chat message
const validateChatMessage = (message) => {
  const errors = [];

  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
  } else {
    const trimmedMessage = message.trim();
    
    if (trimmedMessage.length < 1) {
      errors.push('Message cannot be empty');
    }
    
    if (trimmedMessage.length > 500) {
      errors.push('Message must not exceed 500 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedMessage: message ? message.trim() : ''
  };
};

// Calculate poll statistics
const calculatePollStats = (poll) => {
  if (!poll || !poll.options) {
    return {
      totalVotes: 0,
      optionStats: [],
      winningOption: null
    };
  }

  const totalVotes = poll.answers ? poll.answers.size : 0;
  let maxVotes = 0;
  let winningOption = null;

  const optionStats = poll.options.map(option => {
    const votes = option.votes || 0;
    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    
    if (votes > maxVotes) {
      maxVotes = votes;
      winningOption = option;
    }
    
    return {
      id: option.id,
      text: option.text,
      votes,
      percentage
    };
  });

  return {
    totalVotes,
    optionStats,
    winningOption: winningOption ? {
      id: winningOption.id,
      text: winningOption.text,
      votes: maxVotes,
      percentage: totalVotes > 0 ? Math.round((maxVotes / totalVotes) * 100) : 0
    } : null
  };
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Log with timestamp
const logWithTimestamp = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console[level](logMessage, data);
  } else {
    console[level](logMessage);
  }
};

// Create standardized API response
const createApiResponse = (success, data = null, message = null, errors = null) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

// Check if string is empty or whitespace
const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Parse user agent for basic client info
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };
  
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Simple browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Simple OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { browser, os };
};

module.exports = {
  generateId,
  generateShortId,
  formatTimeRemaining,
  validatePollData,
  validateStudentName,
  validateChatMessage,
  calculatePollStats,
  sanitizeInput,
  logWithTimestamp,
  createApiResponse,
  isEmpty,
  debounce,
  parseUserAgent
};