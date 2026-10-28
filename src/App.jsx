import React, { useEffect, useState, useCallback } from 'react';
import GhostFibers from './components/GhostFibers';
import Ignite from './components/Ignite';
import Prologue from './components/Prologue';
import Scene from './components/Scene';
import Finale from './components/Finale';
import SoundToggle from './components/SoundToggle';
import ProgressRail from './components/ProgressRail';

import { SoundProvider, useSound } from './hooks/useSound';
import { LenisProvider, useLenis } from './hooks/useLenis';
import { useRegistrationAccess } from './hooks/useRegistrationAccess';

import './styles/theme.css';
import './styles/cinematic.css';
import './components/FlyingButton.css';

function AppContent() {
  const { stop, start, scrollTo } = useLenis();
  const { playUiConfirm } = useSound();

  const [isIgnited, setIsIgnited] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('aio_ignited') === '1';
    } catch {
      return false;
    }
  });

  // Stop Lenis scrolling during ignition; resume once ignited
  useEffect(() => {
    if (!isIgnited) {
      stop();
    } else {
      start();
    }
  }, [isIgnited, stop, start]);

  const handleIgniteComplete = useCallback(() => {
    setIsIgnited(true);
    start();
  }, [start]);

  const handleReplayIntro = (e) => {
    e.preventDefault();
    playUiConfirm();
    try {
      sessionStorage.removeItem('aio_ignited');
    } catch {}
    setIsIgnited(false);
    window.scrollTo({ top: 0 });
  };

  const handleNavLink = (targetId) => (e) => {
    e.preventDefault();
    playUiConfirm();
    scrollTo(targetId, { offset: -64 });
  };

  // Reveal on scroll observer for .rv elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.rv').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isIgnited]);

  return (
    <>
      {/* Ambient background with GhostFibers in theme tokens */}
      <div className="ambient-bg" aria-hidden="true">
        <GhostFibers
          glowColor="#8b5cf6"
          secondaryColor="#2fd6e8"
          lineColor="#eef0ff"
          gradient="depth"
          layers={3}
          twist={1.2}
          threads={64}
          volume={0.65}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          mouseInteraction={true}
          speed={0.4}
          flow={0.35}
          vignette={0.4}
          grain={0.05}
        />
      </div>

      {/* Global Fixed Sound Mute Toggle - visible after ignition */}
      {isIgnited && <SoundToggle />}

      {/* Progress Rail (I, II, III Beads) - visible after ignition */}
      {isIgnited && <ProgressRail />}

      {/* Sticky Top Navigation - reveals after ignition */}
      {isIgnited && (
        <nav className="top">
          <a className="logo" href="#prologue" onClick={handleNavLink('#prologue')}>
            <svg className="i" viewBox="0 0 24 24">
              <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
            </svg>
            Coders Club
          </a>
          <div className="links">
            <a href="#prologue" onClick={handleNavLink('#prologue')}>Prologue</a>
            <a href="#scene1" onClick={handleNavLink('#scene1')}>The Movements</a>
            <a href="#brochure" onClick={handleNavLink('#brochure')}>Brochure</a>
            <a href="#details" onClick={handleNavLink('#details')}>Details</a>
            <a href="#resources" onClick={handleNavLink('#resources')}>Resources</a>
            <a className="reg" href="#register" onClick={handleNavLink('#register')}>Register</a>
            <button
              type="button"
              className="btn replay-intro-btn"
              style={{ fontSize: '12px', padding: '4px 10px', marginLeft: 8 }}
              onClick={handleReplayIntro}
              title="Replay the cinematic ignition opening"
            >
              Replay Intro
            </button>
          </div>
        </nav>
      )}

      {/* Main Experience Flow */}
      <main>
        {/* Step 1: Ignition (Press and Hold Opening) */}
        {!isIgnited ? (
          <Ignite onIgniteComplete={handleIgniteComplete} />
        ) : (
          <>
            {/* Step 2: Prologue (Hero Reveal, Title, Conductor First Speech, Scroll Cue) */}
            <Prologue isIgnited={isIgnited} />

            {/* Step 3: Pinned Parallax Scenes for the Three Movements */}
            <div className="scene-container">
              <Scene day={1} />
              <Scene day={2} />
              <Scene day={3} />
            </div>

            {/* Step 4: Finale (Score Flipbook, Details, Venue, FlyingButton Register, Glass Folders) */}
            <Finale />
          </>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <LenisProvider>
        <AppContent />
      </LenisProvider>
    </SoundProvider>
  );
}
