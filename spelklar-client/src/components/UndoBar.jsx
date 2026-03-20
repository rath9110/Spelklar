import React, { useEffect, useRef, useState } from 'react';
import './UndoBar.css';

/**
 * UndoBar – appears after any action, 5s countdown, then auto-dismisses.
 * onUndo: called if user taps undo
 * onExpire: called when countdown ends naturally
 */
export default function UndoBar({ message, onUndo, onExpire, duration = 5 }) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(duration);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [message]);

  const handleUndo = () => {
    clearInterval(intervalRef.current);
    onUndo?.();
  };

  const progress = (remaining / duration) * 100;

  return (
    <div className="undo-bar" role="status" aria-live="polite">
      <div className="undo-bar__progress" style={{ width: `${progress}%` }} />
      <div className="undo-bar__content">
        <span className="undo-bar__message">⟲ {message}</span>
        <button className="undo-bar__btn" onClick={handleUndo} id="undo-action-btn">
          Undo ({remaining}s)
        </button>
      </div>
    </div>
  );
}
