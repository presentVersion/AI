import React from 'react';
import { useSound } from '../hooks/useSound';

export default function SoundToggle() {
  const { muted, toggleMute, playUiConfirm } = useSound();

  const handleClick = () => {
    playUiConfirm();
    toggleMute();
  };

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={handleClick}
      aria-label={muted ? 'Unmute cinematic sound' : 'Mute cinematic sound'}
      title={muted ? 'Unmute sound' : 'Mute sound'}
    >
      <span className="sound-toggle-icon" aria-hidden="true">
        {muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </span>
      <span className="sound-toggle-label">{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  );
}
