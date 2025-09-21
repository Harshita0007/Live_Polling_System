
// src/components/RoleSelection.js
import React from 'react';
import { Users, BarChart3 } from 'lucide-react';
import { PrimaryButton } from './ui/Button';

export function RoleSelection({ selectedRole, onRoleSelect, onContinue }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        Welcome to the Live Polling System
      </h1>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
        Please select the role that best describes you to begin using the live polling system.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        <div
          onClick={() => onRoleSelect('student')}
          className={`p-8 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'student'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-purple-300'
          }`}
        >
          <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">I'm a Student</h3>
          <p className="text-gray-600 text-sm">
            Join classroom sessions, answer live polls, and see results instantly.
          </p>
        </div>
        
        <div
          onClick={() => onRoleSelect('teacher')}
          className={`p-8 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
            selectedRole === 'teacher'
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-purple-300'
          }`}
        >
          <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">I'm a Teacher</h3>
          <p className="text-gray-600 text-sm">
            Create questions in real-time, track responses, and keep your class engaged.
          </p>
        </div>
      </div>
      
      <PrimaryButton onClick={onContinue} disabled={!selectedRole}>
        Continue
      </PrimaryButton>
    </div>
  );
}