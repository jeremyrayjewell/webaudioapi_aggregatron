import React from 'react';
import { createPortal } from 'react-dom';

export default function StartOverlay({ visible, label, onStart }) {
  if (!visible) return null;
  return createPortal(
    <div className="start-overlay" role="dialog" aria-modal="true">
      <button className="splash-button" onClick={onStart} aria-label={label || 'Start Audio'}>
        {label || 'Start Audio'}
      </button>
    </div>,
    document.body
  );
}
