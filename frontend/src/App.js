// src/App.js - Complete Fixed Version
import React, { useState, useEffect } from 'react';
import { BrandPill } from './components/ui/BrandPill';
import { RoleSelection } from './components/RoleSelection';
import { StudentOnboarding } from './components/StudentOnboarding';
import { WaitingScreen } from './components/WaitingScreen';
import { StudentQuestion } from './components/StudentQuestion';
import { PollResults } from './components/PollResults';
import { ChatDock } from './components/ChatDock';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PollHistory } from './components/PollHistory';
import { KickedScreen } from './components/KickedScreen';
import socketService from './services/socketService';
import './App.css';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function App() {
  const [currentView, setCurrentView] = useState('roleSelection');
  const [selectedRole, setSelectedRole] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [roomId, setRoomId] = useState('default-room');
  const [userId, setUserId] = useState(generateId());
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Poll state
  const [activePoll, setActivePoll] = useState(null);
  const [pollHistory, setPollHistory] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [pollResults, setPollResults] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState('chat');
  const [chatText, setChatText] = useState('');
  
  // Participants state
  const [participants, setParticipants] = useState([]);
  
  // Teacher form state
  const [question, setQuestion] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [options, setOptions] = useState([
    { id: generateId(), text: '', correct: false },
    { id: generateId(), text: '', correct: false }
  ]);

  // Initialize socket connection
  useEffect(() => {
    console.log('Initializing socket connection...');
    const socket = socketService.connect();
    
    // Connection event listeners
    socketService.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('CONNECTED to server, socket ID:', socket.id);
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
      console.log('DISCONNECTED from server');
    });

    socketService.on('connect_error', (error) => {
      setConnectionError(error.message);
      console.error('CONNECTION ERROR:', error);
    });

    // Poll event listeners
    socketService.on('poll_created', (pollData) => {
      console.log('POLL RECEIVED by client:', pollData);
      console.log('Current user role:', selectedRole);
      console.log('Current view before update:', currentView);
      
      setActivePoll(pollData);
      setTimeRemaining(pollData.timeLimit);
      setPollResults({}); // Reset results
      
      if (selectedRole === 'student') {
        console.log('Setting student view to studentQuestion');
        setCurrentView('studentQuestion');
        setHasSubmitted(false);
        setSelectedAnswer(null);
      }
    });

    socketService.on('poll_ended', (pollData) => {
      console.log('Poll ended:', pollData);
      
      // Always add to history regardless of current activePoll state
      setPollHistory(prev => [pollData, ...prev]);
      
      // Clear poll state
      setActivePoll(null);
      setHasSubmitted(false);
      setSelectedAnswer(null);
      setPollResults({});
      
      if (selectedRole === 'student') {
        setCurrentView('waitingScreen');
      } else if (selectedRole === 'teacher') {
        setCurrentView('teacherDashboard');
      }
    });

    socketService.on('poll_results', (results) => {
      console.log('Poll results received:', results);
      setPollResults(results);
      
      // If student and has submitted, show results
      if (selectedRole === 'student' && hasSubmitted) {
        setCurrentView('pollResults');
      }
    });

    socketService.on('poll_timer', (time) => {
      setTimeRemaining(time);
    });

    // Participant event listeners
    socketService.on('user_joined', (userData) => {
      console.log('User joined:', userData);
      setParticipants(prev => {
        const exists = prev.find(p => p.id === userData.id);
        if (!exists) {
          return [...prev, userData];
        }
        return prev;
      });
    });

    socketService.on('user_left', (userData) => {
      console.log('User left:', userData);
      setParticipants(prev => prev.filter(p => p.id !== userData.id));
    });

    socketService.on('participants_update', (participantsList) => {
      console.log('Participants updated:', participantsList);
      setParticipants(participantsList);
    });

    socketService.on('user_kicked', (data) => {
      if (data.userId === userId) {
        setCurrentView('kicked');
      }
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
    });

    // Chat event listeners
    socketService.on('message_received', (messageData) => {
      setChatMessages(prev => [...prev, messageData]);
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedRole, hasSubmitted]); // Add hasSubmitted to dependencies

  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
  };

  const handleContinueFromRole = () => {
    if (selectedRole === 'teacher') {
      console.log('Navigating to teacher dashboard');
      const teacherData = {
        id: userId,
        name: 'Teacher',
        role: 'teacher'
      };
      socketService.joinRoom(roomId, teacherData);
      setCurrentView('teacherDashboard');
    } else {
      console.log('Navigating to student onboarding');
      setCurrentView('studentOnboarding');
    }
  };

  const handleStudentContinue = () => {
    if (studentName.trim()) {
      const userData = {
        id: userId,
        name: studentName,
        role: 'student'
      };
      
      console.log('Student joining room:', roomId, 'with data:', userData);
      socketService.joinRoom(roomId, userData);
      setCurrentView('waitingScreen');
    }
  };

  const handleCreatePoll = () => {
    const poll = {
      id: generateId(),
      question: question.trim(),
      options: options
        .filter(opt => opt.text.trim())
        .map(opt => ({ ...opt, votes: 0 })),
      timeLimit: timeLimit,
      createdAt: new Date().toISOString(),
      roomId: roomId
    };
    
    console.log('Creating poll:', poll);
    console.log('Room ID:', roomId);
    console.log('Socket connected:', isConnected);
    
    socketService.createPoll(poll);
    setCurrentView('activeQuestion');
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer && activePoll && !hasSubmitted) {
      console.log('Submitting answer:', selectedAnswer);
      socketService.submitAnswer(activePoll.id, selectedAnswer);
      setHasSubmitted(true);
      
      // Show results immediately after submission
      setTimeout(() => {
        if (Object.keys(pollResults).length > 0) {
          setCurrentView('pollResults');
        }
      }, 500);
    }
  };

  const handleEndPoll = () => {
    if (activePoll) {
      console.log('Ending poll:', activePoll.id);
      socketService.endPoll(activePoll.id);
    }
  };

  const handleNewQuestion = () => {
    setActivePoll(null);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setPollResults({});
    setQuestion('');
    setOptions([
      { id: generateId(), text: '', correct: false },
      { id: generateId(), text: '', correct: false }
    ]);
    setCurrentView('teacherDashboard');
  };

  const handleSendMessage = () => {
    if (chatText.trim()) {
      const messageData = {
        id: generateId(),
        message: chatText.trim(),
        userName: selectedRole === 'teacher' ? 'Teacher' : studentName,
        userId: userId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      socketService.sendMessage(roomId, messageData);
      setChatText('');
    }
  };

  const handleKickUser = (userIdToKick) => {
    console.log('Kicking user:', userIdToKick);
    socketService.kickUser(roomId, userIdToKick);
  };

  // Connection status component
  const ConnectionStatus = () => {
    if (connectionError) {
      return (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          Connection Error: {connectionError}
        </div>
      );
    }
    
    if (!isConnected) {
      return (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
          Connecting to server...
        </div>
      );
    }
    
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 text-sm">
        Connected ({participants.length} users)
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'roleSelection':
        return (
          <RoleSelection
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            onContinue={handleContinueFromRole}
          />
        );

      case 'studentOnboarding':
        return (
          <StudentOnboarding
            name={studentName}
            setName={setStudentName}
            onBack={() => setCurrentView('roleSelection')}
            onContinue={handleStudentContinue}
          />
        );

      case 'waitingScreen':
        return <WaitingScreen timeRemaining={timeRemaining} />;

      case 'studentQuestion':
        return (
          <StudentQuestion
            poll={activePoll}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={setSelectedAnswer}
            onSubmit={handleSubmitAnswer}
            timeRemaining={timeRemaining}
            hasSubmitted={hasSubmitted}
          />
        );

      case 'pollResults':
        return (
          <PollResults
            poll={activePoll}
            results={pollResults}
            timeRemaining={timeRemaining}
            userAnswer={selectedAnswer}
          />
        );

      case 'teacherDashboard':
        return (
          <TeacherDashboard
            question={question}
            setQuestion={setQuestion}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
            options={options}
            setOptions={setOptions}
            participants={participants}
            onBack={() => setCurrentView('roleSelection')}
            onCreate={handleCreatePoll}
            onKickUser={handleKickUser}
            currentView="create"
          />
        );

      case 'activeQuestion':
        return (
          <TeacherDashboard
            question={question}
            setQuestion={setQuestion}
            timeLimit={timeLimit}
            setTimeLimit={setTimeLimit}
            options={options}
            setOptions={setOptions}
            participants={participants}
            activePoll={activePoll}
            pollResults={pollResults}
            onBack={() => setCurrentView('roleSelection')}
            onCreate={handleCreatePoll}
            onEndPoll={handleEndPoll}
            onNewQuestion={handleNewQuestion}
            onViewHistory={() => setCurrentView('pollHistory')}
            onKickUser={handleKickUser}
            currentView="active"
            timeRemaining={timeRemaining}
          />
        );

      case 'pollHistory':
        return (
          <PollHistory
            polls={pollHistory}
            onBack={() => setCurrentView('teacherDashboard')}
          />
        );

      case 'kicked':
        return <KickedScreen />;

      default:
        return (
          <RoleSelection
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            onContinue={handleContinueFromRole}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectionStatus />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-2 rounded z-50">
          <div>View: {currentView}</div>
          <div>Role: {selectedRole}</div>
          <div>Room: {roomId}</div>
          <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
          <div>Poll: {activePoll ? activePoll.question.substring(0, 20) + '...' : 'None'}</div>
          <div>Results: {Object.keys(pollResults).length} options</div>
          <div>Submitted: {hasSubmitted ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      <main className="container max-w-4xl mx-auto py-16 px-4">
        <BrandPill />
        {renderCurrentView()}
      </main>
      
      {/* ChatDock Component */}
      {selectedRole === 'student' && ['waitingScreen', 'studentQuestion', 'pollResults'].includes(currentView) && (
        <ChatDock
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          tab={chatTab}
          setTab={setChatTab}
          messages={chatMessages}
          participants={participants}
          chatText={chatText}
          setChatText={setChatText}
          onSend={handleSendMessage}
          canKick={false}
          onKick={handleKickUser}
        />
      )}
    </div>
  );
}