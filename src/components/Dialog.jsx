import React, { useRef, useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';

export default function Dialog({
  speaker = 'The Conductor',
  text = '',
  displayedText = '',
  typing = false,
  onReplay,
  className = ''
}) {
  const { playUiConfirm } = useSound();
  const [replaying, setReplaying] = useState(false);
  const [localText, setLocalText] = useState(displayedText || text);

  useEffect(() => {
    if (!replaying) {
      setLocalText(displayedText || text);
    }
  }, [displayedText, text, replaying]);

  const handleTap = (e) => {
    e.stopPropagation();
    playUiConfirm();
    setReplaying(true);
    setLocalText('');

    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx += 1;
      setLocalText(text.slice(0, charIdx));
      if (charIdx >= text.length) {
        clearInterval(interval);
        setReplaying(false);
      }
    }, 28);

    onReplay?.();
  };

  return (
    <div className={`dialog-wrapper ${className}`}>
      <div
        className="dialog"
        role="status"
        aria-live="polite"
        aria-label={`${speaker}: ${text}`}
        onClick={handleTap}
        title="Tap to replay line"
      >
        <b className="who">{speaker}</b>
        <p className="say">
          {localText}
          {(typing || replaying) && <span className="dialog-cursor" />}
        </p>
        <span className="dialog-tap-hint">Tap to replay</span>
      </div>
    </div>
  );
}
