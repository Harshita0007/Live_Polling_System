// src/components/WaitingScreen.js
import React from 'react';
import { Clock } from 'lucide-react';

export function WaitingScreen({ timeRemaining }) {
  return (
    <div className="text-center max-w-md mx-auto p-4">
      {/* Spinner */}
      <div className="relative mb-8">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
      </div>
      
      {/* Main Text */}
      <h2 className="text-lg font-medium mb-2 text-gray-900">
        Wait for the teacher to ask questions..
      </h2>
      
      {/* Optional Timer */}
      {timeRemaining > 0 && (
        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 mt-6 inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" />
          <span className="text-sm">Time remaining: {timeRemaining}s</span>
        </div>
      )}
    </div>
  );
}