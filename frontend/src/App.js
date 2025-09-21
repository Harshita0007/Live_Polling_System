import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import io from 'socket.io-client';

// Initialize Socket.io connection
const socket = io('http://localhost:5000');

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [userType, setUserType] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [isKicked, setIsKicked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [forceRender, setForceRender] = useState(0);
  const selectedAnswerRef = useRef(null);
  const nameInputRef = useRef(null);

  // Helper function to check if poll is expired
  const isPollExpired = (poll) => {
    if (!poll) return false;
    const now = Date.now();
    const pollStartTime = poll.startTime;
    const pollDuration = poll.timeLimit * 1000;
    
    // If no startTime, assume poll is still valid (newly created)
    if (!pollStartTime) return false;
    
    return (now - pollStartTime) >= pollDuration;
  };

  // Browser navigation handling
  useEffect(() => {
    // Handle browser back/forward navigation
    const handlePopState = (event) => {
      const view = event.state?.view || 'welcome';
      setCurrentView(view);
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState);

    // Set initial URL
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '') {
      window.history.replaceState({ view: 'welcome' }, '', '/');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update URL when view changes
  useEffect(() => {
    const pathMap = {
      'welcome': '/',
      'student-name': '/student/name',
      'student-waiting': '/student/waiting',
      'student-poll': '/student/poll',
      'poll-results': '/results',
      'teacher-dashboard': '/teacher/dashboard',
      'create-poll': '/teacher/create-poll',
      'teacher-poll-active': '/teacher/poll-active',
      'poll-history': '/teacher/history'
    };

    const path = pathMap[currentView] || '/';
    const currentPath = window.location.pathname;
    
    if (currentPath !== path) {
      window.history.pushState({ view: currentView }, '', path);
    }
  }, [currentView]);

  // Socket.io event handlers
  useEffect(() => {
    // Handle user joined
    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      console.log('Current userType:', userType);
      console.log('Current view:', currentView);
      setUserId(data.userId);
      setHasJoined(true);
      setIsJoining(false); // User has finished joining
      
      if (data.currentPoll) {
        console.log('Active poll found:', data.currentPoll);
        
        // For students, check if poll is still valid before entering
        if (userType === 'student' && isPollExpired(data.currentPoll)) {
          console.log('Poll has expired, redirecting student to waiting screen');
          alert('This poll has expired. Please wait for a new poll.');
          setCurrentView('student-waiting');
          return;
        }
        
        setCurrentPoll(data.currentPoll);
        console.log('Active poll detected');
        
        // For students, always redirect to poll view when there's an active poll
        // For teachers, only redirect if they're not in the process of joining (to avoid redirecting from dashboard)
        if (userType === 'student') {
          console.log('Student joining with active poll, redirecting to poll view');
          setCurrentView('student-poll');
        } else if (!isJoining) {
          console.log('Teacher not joining, redirecting to poll view');
          setCurrentView('teacher-poll-active');
        } else {
          console.log('Teacher is joining, staying on dashboard');
        }
      } else {
        console.log('No active poll found');
        // If student joins and no active poll, show waiting screen
        if (userType === 'student') {
          setCurrentView('student-waiting');
        }
      }
      if (data.results) {
        setPollResults(data.results);
      }
    });

    // Handle new poll
    socket.on('new-poll', (poll) => {
      console.log('New poll received:', poll);
      console.log('Current userType:', userType);
      console.log('Current view:', currentView);
      console.log('Is joining:', isJoining);
      
      // For students, check if poll is still valid before setting it
      if (userType === 'student' && isPollExpired(poll)) {
        console.log('New poll has already expired, not setting it for student');
        alert('The poll has already expired. Please wait for a new poll.');
        return;
      }
      
      setCurrentPoll(poll);
      setTimeLeft(poll.timeLimit);
      setHasAnswered(false);
      // Only redirect to poll view if user is not in the process of joining
      if (!isJoining) {
        console.log('Redirecting to poll view');
        setCurrentView(userType === 'student' ? 'student-poll' : 'teacher-poll-active');
      } else {
        console.log('Not redirecting - user is joining');
        // For students joining, redirect to poll view when new poll arrives
        if (userType === 'student') {
          console.log('Student joining with new poll, redirecting to student-poll');
          setCurrentView('student-poll');
        }
        // For teachers joining, don't redirect - let them stay on dashboard
      }
    });

    // Handle poll results updated
    socket.on('poll-results-updated', (results) => {
      console.log('Poll results updated:', results);
      setPollResults(results);
    });

    // Handle poll ended
    socket.on('poll-ended', (data) => {
      console.log('Poll ended:', data);
      setCurrentPoll(prev => prev ? { ...prev, isActive: false } : null);
      setPollResults(data.results);
      // Only redirect to poll results if we're currently viewing a poll
      setCurrentView(prevView => {
        console.log('Current view when poll ended:', prevView);
        if (prevView === 'student-poll' || prevView === 'teacher-poll-active') {
          console.log('Redirecting to poll-results');
          return 'poll-results';
        } else {
          console.log('Not redirecting, current view is:', prevView);
          return prevView;
        }
      });
    });

    // Handle user count updates
    socket.on('user-count-updated', (data) => {
      console.log('User count updated:', data);
      setUserCount(data.count);
    });

    // Handle user kicked
    socket.on('user-kicked', () => {
      console.log('User was kicked');
      setIsKicked(true);
    });

    // Load poll history on component mount
    const loadPollHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/poll-history');
        const data = await response.json();
        setPollHistory(data.history || []);
      } catch (error) {
        console.error('Failed to load poll history:', error);
      }
    };

    loadPollHistory();

    // Cleanup on unmount
    return () => {
      socket.off('user-joined');
      socket.off('new-poll');
      socket.off('poll-results-updated');
      socket.off('poll-ended');
      socket.off('user-count-updated');
      socket.off('user-kicked');
    };
    }, [userType, isJoining]);

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-6 h-6 bg-white rounded-sm mr-2 flex items-center justify-center">
              <span className="text-purple-600 text-lg">⚡</span>
            </div>
            <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium">
              Intervue Poll
            </span>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Welcome to the Live Polling System
        </h1>
        <p className="text-gray-600 mb-12 text-lg font-medium">
          Please select the role that best describes you to begin using the live polling system
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12">
          <div 
            onClick={() => {
              setUserType('student');
              setHasJoined(false);
              setUserId(null);
              setIsJoining(false);
            }}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 w-full max-w-sm ${
              userType === 'student' 
                ? 'border-2 border-purple-500 ring-2 ring-purple-200' 
                : 'border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            <h3 className="text-xl font-black text-gray-900 mb-3">I'm a Student</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
          
          <div 
            onClick={() => {
              setUserType('teacher');
              setHasJoined(false);
              setUserId(null);
              setIsJoining(false);
            }}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 w-full max-w-sm ${
              userType === 'teacher' 
                ? 'border-2 border-purple-500 ring-2 ring-purple-200' 
                : 'border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            <h3 className="text-xl font-black text-gray-900 mb-3">I'm a Teacher</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            console.log('Continue button clicked, userType:', userType);
            if (userType === 'student') {
              console.log('Navigating to student-name');
              setCurrentView('student-name');
            } else if (userType === 'teacher') {
              console.log('Navigating to teacher-dashboard');
              setIsJoining(true);
              setCurrentView('teacher-dashboard');
              // Emit user-join for teacher after setting the view
              socket.emit('user-join', { name: 'Teacher', role: 'teacher' });
            }
          }}
          disabled={!userType}
          className={`py-4 px-12 rounded-full font-black text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            userType 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const StudentNameEntry = () => {
    // Stable input handler to prevent re-renders
    const handleNameChange = useCallback((e) => {
      console.log('Input onChange triggered, value:', e.target.value);
      setStudentName(e.target.value);
    }, []);

    // Maintain focus on input when component re-renders
    useEffect(() => {
      if (nameInputRef.current && currentView === 'student-name') {
        nameInputRef.current.focus();
      }
    }, [currentView]);

    return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl text-center">
        {/* Intervue Poll Badge - centered at top */}
        <div className="mb-8">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Intervue Poll
          </span>
        </div>

        {/* Description Text - centered */}
        <div className="mb-12">
          <p className="text-gray-600 text-base font-medium max-w-2xl mx-auto">
            If you're a student, you'll be able to <span className="font-bold">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates.
          </p>
        </div>

        {/* Header Section with title - centered */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-800 text-center">Let's Get Started</h1>
        </div>

        {/* Name Input Section - centered */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter your Name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={studentName}
              onChange={handleNameChange}
              onFocus={() => console.log('Input focused')}
              onBlur={() => console.log('Input blurred')}
              placeholder="Rahul Bajaj"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Continue Button - centered */}
        <div className="flex justify-center">
          <button
                  onClick={async () => {
                    if (studentName.trim() && !hasJoined) {
                      console.log('Student joining with name:', studentName);
                      
                      // Check if there's an active poll and if it's still valid
                      let canJoin = true;
                      try {
                        const response = await fetch('http://localhost:5000/api/current-poll');
                        const data = await response.json();
                        
                        console.log('Current poll data:', data);
                        
                        if (data.poll) {
                          console.log('Poll found:', data.poll);
                          console.log('Poll isActive:', data.poll.isActive);
                          console.log('Poll startTime:', data.poll.startTime);
                          console.log('Poll timeLimit:', data.poll.timeLimit);
                          console.log('Current time:', Date.now());
                          console.log('Poll expired check:', isPollExpired(data.poll));
                          
                          // Check both if poll is inactive AND if it's expired
                          if (!data.poll.isActive || isPollExpired(data.poll)) {
                            console.log('Poll is inactive or expired, preventing student from joining');
                            alert('The current poll has ended or expired. Please wait for a new poll to be created.');
                            canJoin = false;
                          }
                        }
                      } catch (error) {
                        console.log('Error checking poll status:', error);
                      }
                      
                      // Only join if poll is valid or no poll exists
                      console.log('Can join:', canJoin);
                      if (canJoin) {
                        console.log('Proceeding with join...');
                        setIsJoining(true);
                        socket.emit('user-join', { name: studentName, role: 'student' });
                        setCurrentView('student-waiting');
                      } else {
                        console.log('Join blocked due to poll status');
                      }
                    }
                  }}
            disabled={!studentName.trim() || hasJoined}
            className="text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '233.93px',
              height: '57.58px',
              borderRadius: '34px',
              background: 'linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)'
            }}
          >
            {hasJoined ? 'Joined' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
    );
  };

  const StudentWaitingScreen = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Connected
          </span>
        </div>
        <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"></div>
        <h2 className="text-xl font-black text-gray-800 mb-2">
          Wait for the teacher to ask questions..
        </h2>
        <p className="text-sm text-gray-600 mb-4 font-medium">
          Connected users: {userCount}
        </p>
      </div>
    </div>
  );

  const StudentPollView = () => {
    // Reset selection when poll changes
    useEffect(() => {
      if (currentPoll) {
        console.log('Poll changed, resetting selection');
        setSelectedAnswer(null);
        setHasAnswered(false);
      }
    }, [currentPoll?.id]);

    useEffect(() => {
      if (!hasAnswered && timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Don't redirect here - let the backend handle poll ending
              // The backend will emit 'poll-ended' event with actual results
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }, [hasAnswered, timeLeft]);

    const handleSubmit = async () => {
      const answerToSubmit = selectedAnswer || selectedAnswerRef.current;
      if (answerToSubmit && currentPoll && userId) {
        try {
          const response = await fetch(`http://localhost:5000/api/polls/${currentPoll.id}/answer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              answer: answerToSubmit,
              userId: userId
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            setHasAnswered(true);
            setPollResults(result.results);
            setCurrentView('poll-results');
          } else {
            const error = await response.json();
            if (error.error === 'Poll has ended') {
              alert('This poll has ended. You cannot submit answers to expired polls.');
              setCurrentView('student-waiting');
            } else {
              alert(`Failed to submit answer: ${error.error}`);
            }
          }
        } catch (error) {
          console.error('Error submitting answer:', error);
          alert('Failed to submit answer. Please try again.');
        }
      }
    };

    console.log('StudentPollView render - selectedAnswer:', selectedAnswer, 'currentPoll:', currentPoll?.id);

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative">
        {/* Header Section - Question 1 and Timer - At the very top */}
        <div className="w-full max-w-4xl mb-4 flex justify-center">
          <div className="flex items-center" style={{ width: '727px' }}>
            <span 
              style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 600,
                fontSize: '22px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#374151'
              }}
            >
              Question 1
            </span>
            <div className="ml-4 flex items-center">
              <svg className="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-red-600">00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Question Display - Below header */}
        <div className="w-full max-w-4xl mb-4 flex justify-center">
          <div 
            className="bg-gray-700 text-white p-4 rounded-lg"
            style={{
              width: '727px',
              borderRadius: '9px'
            }}
          >
            <h2 className="text-lg font-medium text-center">
              {currentPoll.question}
            </h2>
          </div>
        </div>

        {/* Main Answer Container - Centered with exact dimensions */}
        <div className="w-full max-w-4xl flex justify-center mb-8">
          <div 
            className="bg-white border border-gray-300"
            style={{
              width: '727px',
              height: '353px',
              borderRadius: '9px',
              gap: '14px',
              opacity: 1,
              borderWidth: '1px'
            }}
          >
            {/* Options Container */}
            <div className="p-4" style={{ gap: '14px' }}>
              {currentPoll.options.map((option, index) => (
                <button
                  key={`${currentPoll.id}-${index}`}
                  onClick={() => {
                    console.log('Option clicked:', option);
                    console.log('Current selectedAnswer:', selectedAnswer);
                    setSelectedAnswer(option);
                    selectedAnswerRef.current = option;
                    setForceRender(prev => prev + 1); // Force re-render
                    console.log('Setting selectedAnswer to:', option);
                  }}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 mb-3 ${
                    (selectedAnswer === option || selectedAnswerRef.current === option)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                  style={{ gap: '14px' }}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-medium ${
                        (selectedAnswer === option || selectedAnswerRef.current === option)
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-300 bg-white text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-gray-800 font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Submit Button - Right aligned */}
        <div className="w-full max-w-4xl flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer && !selectedAnswerRef.current}
            className="text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              width: '233.93408203125px',
              height: '57.58056640625px',
              borderRadius: '34px',
              background: 'linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)',
              opacity: 1
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  const PollResultsView = () => {
    const chartData = Object.entries(pollResults.results).map(([option, votes]) => ({
      option,
      votes,
      percentage: Math.round((votes / pollResults.totalVotes) * 100)
    }));

    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div>
                  <span className="text-sm text-gray-500">Question 1</span>
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">0:00</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-white bg-gray-700 p-3 rounded-lg mb-6">
              {pollResults.question}
            </h2>
            
            <div className="space-y-4 mb-6">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-600 mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{item.option}</span>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-600 mb-6">
              Wait for the teacher to ask a new question.
            </div>
            
            {userType === 'teacher' && (
              <button
                onClick={() => setCurrentView('create-poll')}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                + Ask a new question
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreatePollView = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [timeLimit, setTimeLimit] = useState(60);
    const [correctAnswers, setCorrectAnswers] = useState({});
    const [allowMultipleCorrect, setAllowMultipleCorrect] = useState(false);

    const addOption = () => {
      if (options.length < 6) {
        setOptions([...options, '']);
      }
    };


    const updateOption = (index, value) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    };

    const setCorrectAnswer = (index, isCorrect) => {
      if (!allowMultipleCorrect && isCorrect) {
        // If multi-select is disabled and we're setting an option as correct,
        // clear all other correct answers first
        setCorrectAnswers({ [index]: true });
      } else {
        setCorrectAnswers(prev => ({
          ...prev,
          [index]: isCorrect
        }));
      }
    };

    const handleCreatePoll = async () => {
      const validOptions = options.filter(opt => opt.trim());
      if (question.trim() && validOptions.length >= 2) {
        const pollData = {
          question: question.trim(),
          options: validOptions,
          timeLimit
        };
        
        try {
          const response = await fetch('http://localhost:5000/api/polls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pollData),
          });
          
          if (response.ok) {
            const result = await response.json();
            setCurrentPoll(result.poll);
            // Redirect to student name entry page to show student experience
            setUserType('student');
            setCurrentView('student-name');
            setHasJoined(false);
            setUserId(null);
          } else {
            const error = await response.json();
            alert(`Failed to create poll: ${error.error}`);
          }
        } catch (error) {
          console.error('Error creating poll:', error);
          alert('Failed to create poll. Please try again.');
        }
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Intervue Poll
                  </span>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-2xl font-black text-gray-800">Let's Get Started</h2>
                </div>
                
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>
              </div>
            
              {/* Question Input Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-black text-gray-700">
                    Enter your question
                  </label>
                  <div className="flex items-center">
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                      <option value={120}>2 minutes</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Rahul Bajaj"
                  rows={3}
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-50"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {question.length}/100
                </div>
              </div>
              
              {/* Options Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-black text-gray-700">
                    Edit Options
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowMultipleCorrect}
                        onChange={(e) => setAllowMultipleCorrect(e.target.checked)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Multi-select</span>
                    </label>
                    <label className="block text-sm font-black text-gray-700">
                      Is it Correct?
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder="Rahul Bajaj"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mr-4"
                      />
                      <div className="flex space-x-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={correctAnswers[index] === true}
                            onChange={() => setCorrectAnswer(index, true)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={correctAnswers[index] === false}
                            onChange={() => setCorrectAnswer(index, false)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addOption}
                  disabled={options.length >= 6}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  + Add More option
                </button>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleCreatePoll}
                  disabled={!question.trim() || options.filter(opt => opt.trim()).length < 2}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-8 rounded-full font-black hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask Question
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Stats Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-black text-gray-800 mb-4">Session Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Connected Students</span>
                <span className="font-black text-2xl text-purple-600">{userCount - 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Active Polls</span>
                <span className="font-black text-2xl text-purple-600">{currentPoll && currentPoll.isActive ? 1 : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Polls Created</span>
                <span className="font-black text-2xl text-purple-600">{pollHistory.length}</span>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-800">Live Chat</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-center text-gray-500 text-sm">
                No messages yet. Start a conversation!
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TeacherDashboard = () => {
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages] = useState([]);

    useEffect(() => {
      // Join as teacher when dashboard loads (only if not already joined)
      if (!hasJoined) {
        socket.emit('user-join', { name: 'Teacher', role: 'teacher' });
      }
    }, []);

    const sendChatMessage = () => {
      if (chatMessage.trim()) {
        socket.emit('send-chat-message', { message: chatMessage });
        setChatMessage('');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-6">
        {/* Main Content Area - Centered */}
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-gray-800">Teacher Dashboard</h1>
            </div>
            <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
              Manage your classroom polls, monitor student engagement, and create interactive learning experiences
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">Quick Actions</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentView('create-poll')}
                    className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Poll
                  </button>
                  <button className="group bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg hover:border-purple-300 hover:text-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Manage Students
                  </button>
                </div>
              </div>
            </div>

            {/* Session Stats Card */}
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">Session Stats</h3>
                </div>
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                    <div className="text-3xl font-black text-purple-600 mb-1">{userCount - 1}</div>
                    <div className="text-sm font-medium text-gray-600">Connected Students</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                    <div className="text-3xl font-black text-green-600 mb-1">{currentPoll && currentPoll.isActive ? 1 : 0}</div>
                    <div className="text-sm font-medium text-gray-600">Active Polls</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                    <div className="text-3xl font-black text-blue-600 mb-1">{pollHistory.length}</div>
                    <div className="text-sm font-medium text-gray-600">Total Polls Created</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentView('poll-history')}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Poll History
            </button>
          </div>
        </div>

      </div>
    );
  };

  const PollHistoryView = () => {
    const handleClearHistory = async () => {
      if (window.confirm('Are you sure you want to clear all poll history? This action cannot be undone.')) {
        try {
          const response = await fetch('http://localhost:5000/api/poll-history', {
            method: 'DELETE'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Poll history cleared:', data.message);
            // Refresh the page to update the UI
            window.location.reload();
          } else {
            alert('Failed to clear poll history. Please try again.');
          }
        } catch (error) {
          console.error('Error clearing poll history:', error);
          alert('Failed to clear poll history. Please try again.');
        }
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-black text-gray-800">View Poll History</h1>
              </div>
              <button
                onClick={handleClearHistory}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                Clear History
              </button>
            </div>
          
          <div className="space-y-6">
            {pollHistory.map((poll, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-black text-gray-800 mb-4">Question {index + 1}</h3>
                <div className="text-white bg-gray-700 p-3 rounded-lg mb-4">
                  {poll.question}
                </div>
                
                <div className="space-y-3">
                  {Object.entries(poll.results).map(([option, votes]) => {
                    const percentage = Math.round((votes / poll.totalVotes) * 100);
                    return (
                      <div key={option} className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-600 mr-3"></div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{option}</span>
                            <span className="text-sm text-gray-600 font-medium">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Stats Section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-black text-gray-800 mb-4">Session Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Connected Students</span>
              <span className="font-black text-2xl text-purple-600">{userCount - 1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Active Polls</span>
              <span className="font-black text-2xl text-purple-600">{currentPoll && currentPoll.isActive ? 1 : 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Polls Created</span>
              <span className="font-black text-2xl text-purple-600">{pollHistory.length}</span>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-black text-gray-800">Live Chat</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="text-center text-gray-500 text-sm">
              No messages yet. Start a conversation!
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const KickedScreen = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
            Removed
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          You've been Kicked out !
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt. Try again sometime.
        </p>
      </div>
    </div>
  );

  // Render appropriate view
  if (isKicked) return <KickedScreen />;
  
  switch (currentView) {
    case 'welcome': 
      return <WelcomeScreen />;
    case 'student-name': 
      return <StudentNameEntry />;
    case 'student-waiting': 
      return <StudentWaitingScreen />;
    case 'student-poll': 
      return <StudentPollView />;
    case 'poll-results': 
      return <PollResultsView />;
    case 'teacher-dashboard': 
      return <TeacherDashboard />;
    case 'create-poll': 
      return <CreatePollView />;
    case 'poll-history': 
      return <PollHistoryView />;
    default: 
      return <WelcomeScreen />;
  }
}

export default App;