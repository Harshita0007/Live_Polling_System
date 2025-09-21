
// src/components/KickedScreen.js
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function KickedScreen() {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="mb-8">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          You've been removed
        </h2>
        <p className="text-gray-600">
          You have been removed from this polling session by the teacher.
        </p>
      </div>
    </div>
  );
}