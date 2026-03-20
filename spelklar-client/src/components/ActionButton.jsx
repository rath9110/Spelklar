import React, { useEffect, useRef } from 'react';
import './ActionButton.css';

const COLOR_MAP = {
  goal:    'var(--color-goal)',
  penalty: 'var(--color-penalty)',
  timeout: 'var(--color-timeout)',
  sub:     'var(--color-sub)',
};

const ICON_MAP = {
  goal:    '⚽',
  penalty: '🟥',
  timeout: '⏱',
  sub:     '↔',
};

/**
 * ActionButton – large, color-coded, full-height action button.
 * Pulses on press. Designed for glove-mode tap targets.
 */
export default function ActionButton({ type, label, onPress, disabled }) {
  const btnRef = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    // Pulse animation
    const el = btnRef.current;
    el.classList.remove('action-btn--pulse');
    void el.offsetWidth; // reflow
    el.classList.add('action-btn--pulse');
    onPress?.(type);
  };

  return (
    <button
      ref={btnRef}
      id={`action-btn-${type}`}
      className={`action-btn ${disabled ? 'action-btn--disabled' : ''}`}
      style={{ '--btn-color': COLOR_MAP[type] }}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="action-btn__icon">{ICON_MAP[type]}</span>
      <span className="action-btn__label">{label}</span>
    </button>
  );
}
