import React from 'react';
import './StatusDot.css';

const STATUS_CONFIG = {
  live:     { color: 'var(--color-live)',    label: 'LIVE',     icon: '●' },
  syncing:  { color: 'var(--color-syncing)', label: 'SYNCING',  icon: '◌' },
  offline:  { color: 'var(--color-offline)', label: 'OFFLINE',  icon: '○' },
};

export default function StatusDot({ status = 'live' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.live;
  return (
    <div className={`status-dot status-dot--${status}`} id="status-indicator">
      <span className="status-dot__icon" style={{ color: cfg.color }}>
        {cfg.icon}
      </span>
      <span className="status-dot__label text-status" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}
