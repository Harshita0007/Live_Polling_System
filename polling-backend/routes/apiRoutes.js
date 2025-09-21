// routes/apiRoutes.js
const express = require('express');
const router = express.Router();
const socketService = require('../services/socketService');

// GET /api/participants - Get all participants
router.get('/participants', (req, res) => {
  try {
    const participants = socketService.getParticipants();
    
    const participantData = participants.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      hasAnswered: p.hasAnswered || false,
      joinedAt: p.joinedAt
    }));

    const stats = {
      total: participants.length,
      students: participants.filter(p => p.role === 'student').length,
      teachers: participants.filter(p => p.role === 'teacher').length,
      answered: participants.filter(p => p.hasAnswered).length
    };

    res.json({
      success: true,
      data: participantData,
      stats: stats
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/chat/messages - Get chat messages
router.get('/chat/messages', (req, res) => {
  try {
    const messages = socketService.getChatMessages();
    
    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/stats - Get system statistics
router.get('/stats', (req, res) => {
  try {
    const participants = socketService.getParticipants();
    const pollHistory = socketService.getPollHistory();
    const currentPoll = socketService.getCurrentPoll();
    const messages = socketService.getChatMessages();

    const stats = {
      participants: {
        total: participants.length,
        students: participants.filter(p => p.role === 'student').length,
        teachers: participants.filter(p => p.role === 'teacher').length
      },
      polls: {
        total: pollHistory.length,
        active: currentPoll ? 1 : 0,
        completed: pollHistory.length
      },
      chat: {
        totalMessages: messages.length
      },
      currentPoll: currentPoll ? {
        id: currentPoll.id,
        question: currentPoll.question,
        timeRemaining: socketService.getRemainingTime(),
        totalOptions: currentPoll.options.length,
        totalAnswers: currentPoll.answers ? currentPoll.answers.size : 0
      } : null
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;