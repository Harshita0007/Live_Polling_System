// src/components/ui/Button.js
import React from 'react';

export function PrimaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = "",
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r from-purple-600 to-purple-700 
        hover:from-purple-700 hover:to-purple-800 
        disabled:from-gray-400 disabled:to-gray-500
        text-white font-semibold px-8 py-3 rounded-lg 
        transition-all duration-200 
        disabled:cursor-not-allowed disabled:opacity-70
        hover:shadow-lg hover:shadow-purple-500/25
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = "",
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white border border-gray-300 
        hover:bg-gray-50 hover:border-gray-400
        disabled:bg-gray-100 disabled:border-gray-200
        text-gray-700 font-semibold px-8 py-3 rounded-lg 
        transition-all duration-200 
        disabled:cursor-not-allowed disabled:opacity-70
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}