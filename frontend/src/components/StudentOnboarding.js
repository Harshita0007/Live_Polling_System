import React from 'react';
import { ArrowLeft } from 'lucide-react';

// CSS styles as a string to ensure they're applied
const styles = `
  .student-onboarding-container {
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
  
  .student-onboarding-content {
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
  
  .main-heading {
    font-size: 2.25rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #111827;
    line-height: 1.2;
  }
  
  .subtitle {
    color: #6B7280;
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 24rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2rem;
  }
  
  .input-group {
    margin-bottom: 2rem;
    text-align: left;
  }
  
  .input-label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }
  
  .name-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.5rem;
    font-size: 1rem;
    background-color: #F9FAFB;
    color: #374151;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  
  .name-input:focus {
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .primary-button {
    display: inline-flex;
    align-items: center;
    background-color: #8B5CF6;
    color: white;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .primary-button:hover:not(:disabled) {
    background-color: #7C3AED;
  }
  
  .primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .secondary-button {
    display: inline-flex;
    align-items: center;
    background-color: #E5E7EB;
    color: #374151;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .secondary-button:hover {
    background-color: #D1D5DB;
  }
  
  .icon-margin {
    margin-right: 0.5rem;
  }
  
  .font-semibold {
    font-weight: 600;
  }
`;

export function StudentOnboarding({ name, setName, onBack, onContinue }) {
  return (
    <>
      <style>{styles}</style>
      <div className="student-onboarding-container">
        <div className="student-onboarding-content">
          {/* Header Badge */}
          <div className="brand-pill">
            ← Interval Poll
          </div>
          
          {/* Main Heading */}
          <h1 className="main-heading">
            Let's Get Started
          </h1>
          
          {/* Subtitle */}
          <p className="subtitle">
            If you're a student, you'll be able to{' '}
            <span className="font-semibold" style={{ color: '#111827' }}>
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with your classmates.
          </p>
          
          {/* Name Input */}
          <div className="input-group">
            <label className="input-label">
              Enter your Name
            </label>
            <input
              type="text"
              placeholder="Rahul Bajaj"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-input"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="button-group">
            <button onClick={onBack} className="secondary-button">
              <ArrowLeft size={16} className="icon-margin" />
              Back
            </button>
            <button 
              onClick={onContinue} 
              disabled={!name.trim()}
              className="primary-button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Demo Component
export default function App() {
  const [name, setName] = React.useState('');
  
  const handleBack = () => {
    console.log('Back clicked');
  };
  
  const handleContinue = () => {
    console.log('Continue clicked with name:', name);
  };
  
  return (
    <StudentOnboarding
      name={name}
      setName={setName}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}