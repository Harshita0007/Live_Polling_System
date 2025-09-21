// src/components/ui/ProgressBar.js
import React from 'react';

export function ProgressBar({ percentage, label, option }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-600 font-semibold text-white text-xs">
          {option}
        </span>
        <span>{label}</span>
      </div>
      <div className="relative h-8 overflow-hidden rounded-md bg-gray-200">
        <div 
          className="h-full bg-purple-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <span className="absolute inset-y-0 right-2 flex items-center text-sm font-semibold text-gray-700">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
