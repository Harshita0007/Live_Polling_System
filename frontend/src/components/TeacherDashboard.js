import React, { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const PrimaryButton = ({ children, onClick, disabled, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);

export function TeacherDashboard({ 
  question: initialQuestion = '', 
  setQuestion: setQuestionProp, 
  timeLimit: initialTimeLimit = 60, 
  setTimeLimit: setTimeLimitProp, 
  options: initialOptions, 
  setOptions: setOptionsProp, 
  onBack, 
  onCreate,
  onEndPoll,
  onNewQuestion,
  onViewHistory,
  onKickUser,
  participants = [],
  activePoll,
  pollResults = {},
  timeRemaining = 0,
  currentView = 'create' // 'create' | 'active' | 'history'
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [timeLimit, setTimeLimit] = useState(initialTimeLimit);
  const [options, setOptions] = useState(initialOptions || [
    { id: generateId(), text: '', correct: false },
    { id: generateId(), text: '', correct: false }
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update functions that sync with parent props
  const updateQuestion = (newQuestion) => {
    setQuestion(newQuestion);
    if (setQuestionProp) setQuestionProp(newQuestion);
  };

  const updateTimeLimit = (newTimeLimit) => {
    setTimeLimit(newTimeLimit);
    if (setTimeLimitProp) setTimeLimitProp(newTimeLimit);
  };

  const updateOptions = (newOptions) => {
    setOptions(newOptions);
    if (setOptionsProp) setOptionsProp(newOptions);
  };

  const addOption = () => {
    const newOptions = [...options, { id: generateId(), text: '', correct: false }];
    updateOptions(newOptions);
  };

  const removeOption = (id) => {
    if (options.length > 2) {
      const newOptions = options.filter(opt => opt.id !== id);
      updateOptions(newOptions);
    }
  };

  const updateOption = (id, text) => {
    const newOptions = options.map(opt => opt.id === id ? { ...opt, text } : opt);
    updateOptions(newOptions);
  };

  const setCorrectAnswer = (id) => {
    const newOptions = options.map(opt => ({ 
      ...opt, 
      correct: opt.id === id 
    }));
    updateOptions(newOptions);
  };

  const handleAskQuestion = () => {
    const validOptions = options.filter(opt => opt.text.trim());
    const hasCorrectAnswer = options.some(opt => opt.correct);
    
    if (question.trim() && validOptions.length >= 2 && hasCorrectAnswer) {
      if (onCreate) {
        onCreate({
          question,
          timeLimit,
          options: validOptions
        });
      }
    }
  };

  const timeOptions = [15, 30, 45, 60, 90, 120, 180, 300];

  // Check if form is valid
  const validOptions = options.filter(opt => opt.text.trim());
  const hasCorrectAnswer = options.some(opt => opt.correct);
  const isFormValid = question.trim() && validOptions.length >= 2 && hasCorrectAnswer;

  // If showing active question results
  if (currentView === 'active' && activePoll) {
    const pollOptions = activePoll.options || validOptions;
    const totalVotes = Object.values(pollResults).reduce((sum, votes) => sum + votes, 0) || 1;
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Header with View Poll History and End Poll buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button 
              onClick={onViewHistory}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              👁️ View Poll History
            </button>
            <button 
              onClick={onEndPoll}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-medium"
            >
              End Poll
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Question Area - 3 columns */}
            <div className="lg:col-span-3">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Question 1</h1>
                <div className="flex items-center text-red-600 font-medium">
                  <span className="mr-1">⏱️</span>
                  <span>00:{timeRemaining < 10 ? '0' + timeRemaining : timeRemaining}</span>
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-gray-700 text-white p-4 rounded-t-lg mb-0">
                <p className="font-medium">{activePoll.question}</p>
              </div>

              {/* Real-time Results */}
              <div className="bg-white border-2 border-gray-200 rounded-b-lg p-6 mb-6">
                <div className="space-y-4">
                  {pollOptions.map((option, index) => {
                    const optionKey = option.text || option.id || option;
                    const votes = pollResults[optionKey] || 0;
                    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                    const isCorrect = option.correct;
                    
                    return (
                      <div key={option.id || index} className="relative">
                        <div className="bg-gray-200 rounded-lg overflow-hidden h-14">
                          <div 
                            className={`h-full flex items-center transition-all duration-500 ${
                              isCorrect ? 'bg-green-500' : 'bg-purple-600'
                            }`}
                            style={{width: `${percentage}%`}}
                          >
                            <div className="absolute left-0 w-full h-full flex items-center justify-between px-4">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center h-8 w-8 bg-white text-gray-800 text-sm font-bold rounded-full">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="font-medium text-gray-800">{option.text}</span>
                                {isCorrect && (
                                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-800 font-bold text-lg">{percentage}%</span>
                                <span className="text-gray-600 text-sm">({votes} votes)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Live Stats */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Total Responses: {totalVotes} / {participants.filter(p => p.role === 'student').length} students
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button 
                  onClick={onNewQuestion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-medium"
                >
                  + Ask a new question
                </button>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {totalVotes}
                  </div>
                  <p className="text-gray-500 text-sm">Total Responses</p>
                </div>
                
                {/* Participants Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-600">👥</span>
                    <h4 className="font-semibold text-gray-800">
                      Participants ({participants.length})
                    </h4>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {participants.length > 0 ? (
                      participants.map((participant, index) => (
                        <div key={participant.id || index} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              participant.role === 'teacher' ? 'bg-green-500' : 'bg-purple-500'
                            }`}></div>
                            <span className="text-sm text-gray-700 font-medium">
                              {participant.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {participant.role === 'teacher' ? '👨‍🏫' : 'Kick Out'}
                            </span>
                            {participant.role === 'student' && onKickUser && (
                              <button
                                onClick={() => onKickUser(participant.id)}
                                className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded"
                              >
                                Kick
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No participants yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create poll view
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started</h1>
          <p className="text-gray-600 max-w-2xl">
            You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Question Input */}
              <div className="mb-8">
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Enter your question
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => updateQuestion(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                    maxLength={100}
                  />
                  <div className="absolute right-4 top-4 text-sm text-gray-400">
                    {question.length}/100
                  </div>
                </div>
              </div>

              {/* Time Limit Dropdown */}
              <div className="mb-8">
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-4 py-3 bg-gray-50 border-0 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-3 min-w-[150px] hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700">{timeLimit} seconds</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                      {timeOptions.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            updateTimeLimit(time);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg text-gray-700"
                        >
                          {time} seconds
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Options Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-gray-800">Edit Options</h3>
                  <h3 className="text-base font-semibold text-gray-800">Is it Correct?</h3>
                </div>

                <div className="space-y-4">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-4">
                      {/* Option Letter Circle */}
                      <div className="flex items-center justify-center h-10 w-10 bg-purple-600 text-white text-base font-bold rounded flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      
                      {/* Option Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Enter option text"
                          value={option.text}
                          onChange={(e) => updateOption(option.id, e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base placeholder-gray-400"
                        />
                      </div>
                      
                      {/* Yes/No Radio Buttons */}
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={option.correct}
                            onChange={() => setCorrectAnswer(option.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="text-green-600 font-medium">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={!option.correct}
                            readOnly
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                          />
                          <span className="text-red-600 font-medium">No</span>
                        </label>
                      </div>

                      {/* Remove Button */}
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add More Option Button */}
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-purple-600 font-medium mt-6 hover:text-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add More option
                </button>
              </div>

              {/* Ask Question Button */}
              <div className="text-center">
                <PrimaryButton
                  onClick={handleAskQuestion}
                  disabled={!isFormValid}
                >
                  Ask Question
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm mb-4">Poll results will appear here when a question is active.</p>
              </div>
              
              {/* Participants Section - Always visible */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-600">👥</span>
                  <h4 className="font-semibold text-gray-800">
                    Participants ({participants.length})
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <div key={participant.id || index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            participant.role === 'teacher' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="text-sm text-gray-700 font-medium">
                            {participant.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {participant.role === 'teacher' ? '👨‍🏫' : '🎓'}
                          </span>
                          {participant.role === 'student' && onKickUser && (
                            <button
                              onClick={() => onKickUser(participant.id)}
                              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 hover:bg-red-50 rounded"
                            >
                              Kick
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No participants yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}