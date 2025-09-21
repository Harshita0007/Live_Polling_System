// routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const socketService = require('../services/socketService');

// GET /api/polls/current - Get current active poll
router.get('/current', (req, res) => {
  try {
    const currentPoll = socketService.getCurrentPoll();
    
    if (!currentPoll) {
      return res.json({
        success: true,
        data: null,
        message: 'No active poll'
      });
    }

    res.json({
      success: true,
      data: {
        id: currentPoll.id,
        question: currentPoll.question,
        options: currentPoll.options.map(opt => ({
          id: opt.id,
          text: opt.text
        })),
        timeLimit: currentPoll.timeLimit,
        timeRemaining: socketService.getRemainingTime(),
        createdAt: currentPoll.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting current poll:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/polls/history - Get poll history
router.get('/history', (req, res) => {
  try {
    const pollHistory = socketService.getPollHistory();
    
    res.json({
      success: true,
      data: pollHistory,
      count: pollHistory.length
    });
  } catch (error) {
    console.error('Error getting poll history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/polls/results/:pollId - Get specific poll results
router.get('/results/:pollId', (req, res) => {
  try {
    const { pollId } = req.params;
    const pollHistory = socketService.getPollHistory();
    const currentPoll = socketService.getCurrentPoll();
    
    let poll = pollHistory.find(p => p.id === pollId);
    
    // Check if it's the current poll
    if (!poll && currentPoll && currentPoll.id === pollId) {
      poll = currentPoll;
    }
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const results = poll.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      percentage: poll.answers ? 
        Math.round((opt.votes / poll.answers.size) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        id: poll.id,
        question: poll.question,
        results: results,
        totalVotes: poll.answers ? poll.answers.size : 0,
        createdAt: poll.createdAt,
        endedAt: poll.endedAt || null
      }
    });
  } catch (error) {
    console.error('Error getting poll results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;