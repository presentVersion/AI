import React, { useState, useEffect } from 'react';
import { useLenis } from '../hooks/useLenis';
import { useSound } from '../hooks/useSound';

export default function ProgressRail() {
  const { scrollTo } = useLenis();
  const { playUiConfirm } = useSound();
  const [activeScene, setActiveScene] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');

      if (!s1 || !s2 || !s3) return;

      const scrollY = window.scrollY;
      const s1Top = s1.offsetTop - 300;
      const s2Top = s2.offsetTop - 300;
      const s3Top = s3.offsetTop - 300;
      const s3Bottom = s3.offsetTop + s3.offsetHeight;

      // Only show rail once user reaches the scenes
      if (scrollY >= s1Top && scrollY <= s3Bottom + 500) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      if (scrollY >= s3Top) {
        setActiveScene(3);
      } else if (scrollY >= s2Top) {
        setActiveScene(2);
      } else if (scrollY >= s1Top) {
        setActiveScene(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  const handleBeadClick = (day) => {
    playUiConfirm();
    scrollTo(`#scene${day}`, { offset: 0 });
  };

  return (
    <nav className="progress-rail" aria-label="Movements Navigation">
      <button
        type="button"
        className={`rail-bead ${activeScene === 1 ? 'active' : ''}`}
        onClick={() => handleBeadClick(1)}
        aria-label="Scroll to Movement 1"
        title="Movement I"
      >
        I
      </button>
      <button
        type="button"
        className={`rail-bead ${activeScene === 2 ? 'active' : ''}`}
        onClick={() => handleBeadClick(2)}
        aria-label="Scroll to Movement 2"
        title="Movement II"
      >
        II
      </button>
      <button
        type="button"
        className={`rail-bead ${activeScene === 3 ? 'active' : ''}`}
        onClick={() => handleBeadClick(3)}
        aria-label="Scroll to Movement 3"
        title="Movement III"
      >
        III
      </button>
    </nav>
  );
}
