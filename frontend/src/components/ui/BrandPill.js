import React from 'react';
import { Check } from 'lucide-react';

export function BrandPill() {
  return React.createElement(
    'div',
    { style: { textAlign: 'center', marginBottom: '2rem' } },
    React.createElement(
      'div',
      {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#8B5CF6',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      React.createElement(Check, { size: 12 }),
      'LivePolling'
    )
  );
}
