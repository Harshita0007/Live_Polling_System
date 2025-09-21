import React from 'react';
import { Users, UserMinus } from 'lucide-react';

export function ParticipantList({ participants, onKickUser, isTeacher }) {
  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1rem',
        width: '200px',
        maxHeight: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }
    },
    React.createElement(
      'h3',
      {
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }
      },
      React.createElement(Users, { size: 16 }),
      'Participants (' + participants.length + ')'
    ),
    React.createElement(
      'div',
      { style: { maxHeight: '200px', overflowY: 'auto' } },
      participants.map(function (participant, index) {
        return React.createElement(
          'div',
          {
            key: index,
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0',
              borderBottom:
                index < participants.length - 1 ? '1px solid #F3F4F6' : 'none'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
            React.createElement('div', {
              style: {
                width: '8px',
                height: '8px',
                backgroundColor:
                  participant.role === 'teacher' ? '#10B981' : '#8B5CF6',
                borderRadius: '50%'
              }
            }),
            React.createElement(
              'span',
              {
                style: {
                  fontSize: '12px',
                  color: '#1F2937',
                  fontWeight: participant.role === 'teacher' ? '600' : '400'
                }
              },
              participant.name
            )
          ),
          isTeacher &&
            participant.role === 'student' &&
            React.createElement(
              'button',
              {
                onClick: function () {
                  return onKickUser(participant.id);
                },
                style: {
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '2px'
                }
              },
              React.createElement(UserMinus, { size: 12 })
            )
        );
      })
    )
  );
}
