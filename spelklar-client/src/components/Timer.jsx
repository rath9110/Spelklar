import React from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Timer({ seconds = 0, running = false }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      id="match-timer"
      className="text-timer"
      style={{
        color: running ? 'var(--color-dark)' : 'var(--color-muted)',
        transition: 'color 300ms ease',
      }}
      aria-label={`Match time: ${mins} minutes ${secs} seconds`}
    >
      {pad(mins)}:{pad(secs)}
    </div>
  );
}
