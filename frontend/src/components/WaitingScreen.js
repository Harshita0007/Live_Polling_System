import React from 'react';
import { Clock } from 'lucide-react';

const styles = `
  .waiting-screen-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    margin: 0;
    box-sizing: border-box;
    z-index: 1000;
  }
  
  .waiting-screen-content {
    max-width: 28rem;
    width: 100%;
    text-align: center;
  }
  
  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #8B5CF6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2rem;
  }
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #E5E7EB;
    border-top-color: #8B5CF6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem auto;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .main-heading {
    font-size: 1.125rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  .timer-display {
    background-color: #F3F4F6;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #E5E7EB;
    margin-top: 1.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
`;

export function WaitingScreen({ timeRemaining }) {
  return (
    <>
      <style>{styles}</style>
      <div className="waiting-screen-container">
        <div className="waiting-screen-content">
          {/* Brand Badge */}
          <div className="brand-pill">
            Intervue Poll Poll
          </div>
          
          {/* Spinner */}
          <div className="spinner"></div>
          
          {/* Main Text */}
          <h2 className="main-heading">
            Wait for the teacher to ask questions..
          </h2>
          
          {/* Optional Timer */}
          {timeRemaining > 0 && (
            <div className="timer-display">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Time remaining: {timeRemaining}s</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}