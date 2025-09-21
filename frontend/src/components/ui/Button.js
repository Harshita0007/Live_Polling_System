
// src/components/ui/Button.js
import React from 'react';

export function PrimaryButton({ className = "", children, disabled, onClick, ...props }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center rounded-full bg-purple-600 px-6 py-2.5 text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className = "", children, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full bg-gray-200 px-6 py-2.5 text-gray-900 shadow-sm transition hover:bg-gray-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
