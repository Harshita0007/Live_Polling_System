import React from 'react';

// Sparkle icon component
const SparkleIcon = ({ size = 12 }) => {
  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      style: { flexShrink: 0 }
    },
    React.createElement('path', {
      d: 'M12 0L14.09 8.26L22 12L14.09 15.74L12 24L9.91 15.74L2 12L9.91 8.26L12 0Z',
      fill: 'currentColor'
    }),
    React.createElement('path', {
      d: 'M19 4L19.74 6.26L22 7L19.74 7.74L19 10L18.26 7.74L16 7L18.26 6.26L19 4Z',
      fill: 'currentColor'
    }),
    React.createElement('path', {
      d: 'M5 14L5.74 16.26L8 17L5.74 17.74L5 20L4.26 17.74L2 17L4.26 16.26L5 14Z',
      fill: 'currentColor'
    })
  );
};

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
          background: 'linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }
      },
      React.createElement(SparkleIcon, { size: 12 }),
      'Intervue Poll'
    )
  );
}