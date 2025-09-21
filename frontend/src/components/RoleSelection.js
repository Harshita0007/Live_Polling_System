// src/components/RoleSelection.js
import React from 'react';
import { PrimaryButton } from './ui/Button';

export function RoleSelection({ selectedRole, onRoleSelect, onContinue }) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        Welcome to the <span className="text-black-600">Live Polling System</span>
      </h1>
      <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12">
        Please select the role that best describes you to begin using the live polling system
      </p>
      
      {/* Role Selection Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
        <div
          onClick={() => onRoleSelect('student')}
          className={`p-8 rounded-2xl cursor-pointer transition-all duration-200 ${
            selectedRole === 'student'
              ? 'border-2 border-purple-600 bg-white shadow-lg transform -translate-y-1'
              : 'border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 shadow-sm'
          }`}
        >
         
          <h3 className="text-xl font-bold mb-3 text-gray-900">I'm a Student</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </p>
        </div>
        
        <div
          onClick={() => onRoleSelect('teacher')}
          className={`p-8 rounded-2xl cursor-pointer transition-all duration-200 ${
            selectedRole === 'teacher'
              ? 'border-2 border-purple-600 bg-white shadow-lg transform -translate-y-1'
              : 'border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 shadow-sm'
          }`}
        >
         
          <h3 className="text-xl font-bold mb-3 text-gray-900">I'm a Teacher</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Submit answers and view live poll results in real-time.
          </p>
        </div>
      </div>
      
      {/* Continue Button */}
      <div className="text-center">
        <PrimaryButton 
          onClick={onContinue} 
          disabled={!selectedRole}
          className="px-12 py-3 text-lg font-medium"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}