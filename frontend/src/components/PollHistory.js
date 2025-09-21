// src/components/PollHistory.js
import React from 'react';
import { ArrowLeft, Calendar, Users, Clock } from 'lucide-react';
import { SecondaryButton, PrimaryButton } from './ui/Button';

export function PollHistory({ polls, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
              ← Intervue Poll Poll
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Poll History</h1>
            <p className="text-gray-600 text-sm mt-1">
              View and analyze your previous polling sessions and results.
            </p>
          </div>
          <SecondaryButton onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </SecondaryButton>
        </div>
        
        {polls.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No polls conducted yet</h3>
              <p className="text-gray-600 mb-6">
                Start creating polls to see your history and analytics here.
              </p>
              <PrimaryButton onClick={onBack}>
                Create Your First Poll
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll, pollIndex) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
              const createdAt = poll.createdAt || new Date().toISOString();
              
              return (
                <div key={poll.id || pollIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Poll Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Question {pollIndex + 1}</span>
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">{poll.timeLimit || 60}s</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalVotes} responses
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Poll Content */}
                  <div className="p-6">
                    {/* Question */}
                    <div className="bg-gray-700 text-white p-3 rounded-lg mb-6 text-center">
                      <h3 className="font-medium">{poll.question}</h3>
                    </div>
                    
                    {/* Results */}
                    <div className="space-y-3">
                      {poll.options.map((option, index) => {
                        const votes = option.votes || 0;
                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                        const isCorrect = option.correct;
                        
                        return (
                          <div key={option.id || index} className="relative">
                            <div className="bg-gray-200 rounded-lg overflow-hidden h-12">
                              <div 
                                className={`h-full flex items-center transition-all duration-500 ${
                                  isCorrect ? 'bg-green-500' : 'bg-purple-600'
                                }`}
                                style={{ width: `${Math.max(percentage, 10)}%` }}
                              >
                                <div className="absolute left-0 w-full h-full flex items-center px-4">
                                  <div className="flex items-center gap-3 text-white">
                                    <span className="flex items-center justify-center h-6 w-6 bg-white text-gray-800 text-xs font-semibold rounded">
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="font-medium">{option.text}</span>
                                    {isCorrect && (
                                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                                        Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800">
                                {percentage}%
                              </span>
                              <span className="text-xs text-gray-500">
                                ({votes} votes)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Poll Stats */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{totalVotes}</div>
                          <div className="text-sm text-gray-600">Total Responses</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((poll.options.find(opt => opt.correct)?.votes || 0) / Math.max(totalVotes, 1) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Correct Answers</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-600">{poll.timeLimit || 60}s</div>
                          <div className="text-sm text-gray-600">Time Limit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Summary Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{polls.length}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {polls.reduce((sum, poll) => sum + poll.options.reduce((optSum, opt) => optSum + (opt.votes || 0), 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      polls.reduce((sum, poll) => {
                        const totalVotes = poll.options.reduce((optSum, opt) => optSum + (opt.votes || 0), 0);
                        const correctVotes = poll.options.find(opt => opt.correct)?.votes || 0;
                        return sum + (totalVotes > 0 ? correctVotes / totalVotes : 0);
                      }, 0) / Math.max(polls.length, 1) * 100
                    )}%
                  </div>
                  <div className="text-sm text-gray-600">Avg. Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(polls.reduce((sum, poll) => sum + (poll.timeLimit || 60), 0) / Math.max(polls.length, 1))}s
                  </div>
                  <div className="text-sm text-gray-600">Avg. Time Limit</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}