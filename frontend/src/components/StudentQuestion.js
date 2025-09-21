import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export function StudentQuestion({ 
  poll, 
  selectedAnswer, 
  onSelectAnswer, 
  onSubmit, 
  timeRemaining, 
  hasSubmitted 
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Chat');
  const [messages, setMessages] = useState([
    { user: 'User 1', message: 'Hey there, how can I help?', isOwn: false },
    { user: 'User 2', message: 'Nothing bro, just chill!!', isOwn: true }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { user: 'You', message: newMessage, isOwn: true }]);
      setNewMessage('');
    }
  };

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              LivePolling
            </div>
            <p className="text-gray-600 text-lg">Wait for the teacher to ask questions..</p>
            {timeRemaining > 0 && (
              <div className="mt-4 flex items-center justify-center text-red-600">
                <span className="mr-2">⏰</span>
                <span className="text-sm">Time remaining: {timeRemaining}s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-4xl mx-auto p-6">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Question 1</h1>
          <div className="flex items-center text-red-600 font-medium">
            <span className="mr-1">⏱️</span>
            <span>00:{timeRemaining < 10 ? '0' + timeRemaining : timeRemaining}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area - 2 columns */}
          <div className="lg:col-span-2">
            {/* Question Box */}
            <div className="bg-gray-700 text-white p-4 rounded-t-lg mb-0">
              <p className="font-medium">{poll.question}</p>
            </div>

            {/* Options Container */}
            <div className="bg-white border-2 border-gray-200 rounded-b-lg p-6 mb-6">
              <div className="space-y-3 mb-6">
                {poll.options.map((option, index) => {
                  const optionId = option.id || option.text || option;
                  const optionText = option.text || option;
                  const isSelected = selectedAnswer === optionId;
                  
                  return (
                    <button
                      key={optionId || index}
                      onClick={() => !hasSubmitted && onSelectAnswer(optionId)}
                      disabled={hasSubmitted}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      } ${hasSubmitted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <span className={`flex items-center justify-center h-6 w-6 text-white text-xs font-semibold rounded-full mr-3 ${
                        isSelected ? 'bg-purple-600' : 'bg-gray-400'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-base">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!hasSubmitted ? (
                <div className="text-center">
                  <button
                    onClick={onSubmit}
                    disabled={!selectedAnswer}
                    className={`px-8 py-3 rounded-full font-medium text-white transition-all ${
                      selectedAnswer
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-700 text-lg font-medium">
                    Wait for the teacher to ask a new question.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-gray-200 h-96 flex flex-col">
              {/* Chat Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('Chat')}
                  className={`flex-1 p-3 text-sm font-medium ${
                    activeTab === 'Chat' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('Participants')}
                  className={`flex-1 p-3 text-sm font-medium ${
                    activeTab === 'Participants' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600'
                  }`}
                >
                  Participants
                </button>
              </div>

              {/* Chat Content */}
              {activeTab === 'Chat' && (
                <>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.isOwn 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-white'
                          }`}>
                            <div className="font-semibold text-xs mb-1">{msg.user}</div>
                            <div>{msg.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Participants Content */}
              {activeTab === 'Participants' && (
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Active Participants (3)</div>
                    <div className="space-y-1">
                      <div className="text-sm">User 1</div>
                      <div className="text-sm">User 2</div>
                      <div className="text-sm">You</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Toggle Button - Bottom Right */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all z-50 lg:hidden"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

export default StudentQuestion;