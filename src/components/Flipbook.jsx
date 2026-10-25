import React, { useState, useEffect, useRef } from 'react';
import './OrchestraBook.css';
import { useSound } from '../hooks/useSound';

export default function Flipbook() {
  const { playUiConfirm } = useSound();
  // Phases:
  // 'idle'     -> Waiting for user (mobile or desktop) to scroll down to brochure section
  // 'rapid'    -> Anime-style rapid page flutter from right to left
  // 'slowing'  -> Decelerating into open arched fanned orchestra score
  // 'landing'  -> Gliding closer to screen & folding down onto cover page
  // 'settled'  -> Interactive live participants flipbook (untouched original HTML)
  const [phase, setPhase] = useState('idle');
  const containerRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const timerRef = useRef(null);

  // Scroll Trigger via IntersectionObserver for Mobile & Desktop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            setPhase('rapid');
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Orchestrated sequence: Rapid Flutter -> Deceleration -> Cover Landing -> Settled Flipbook
  useEffect(() => {
    if (phase === 'rapid') {
      // Rapid anime-style flutter for 2.2s, then begin slowing down
      timerRef.current = setTimeout(() => {
        setPhase('slowing');
      }, 2200);
    } else if (phase === 'slowing') {
      // Graceful open arched state for 1.8s, then glide to cover
      timerRef.current = setTimeout(() => {
        setPhase('landing');
      }, 1800);
    } else if (phase === 'landing') {
      // Camera glide & cover settlement takes 1.35s, then reveal live flipbook
      timerRef.current = setTimeout(() => {
        setPhase('settled');
      }, 1350);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  const handleStageClick = () => {
    playUiConfirm();
    if (phase === 'idle' || phase === 'rapid') {
      setPhase('slowing');
    } else if (phase === 'slowing') {
      setPhase('landing');
    } else if (phase === 'landing') {
      setPhase('settled');
    }
  };

  const skipToCover = (e) => {
    e.stopPropagation();
    playUiConfirm();
    setPhase('landing');
  };

  const replaySequence = () => {
    playUiConfirm();
    setPhase('rapid');
  };

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      {phase === 'settled' ? (
        /* ========================================================
           SETTLED STATE: The Untouched Original Flipbook HTML
           (Directly embeds AI-Agent-Orchestra-Participants-Flipbook.html)
           ======================================================== */
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(185, 164, 255, 0.22)',
            boxShadow: '0 30px 90px -20px rgba(0, 0, 0, 0.85)',
            background: '#06041a'
          }}
        >
          {/* Top Floating Control Bar */}
          <div className="flipbook-topbar">
            <button
              onClick={replaySequence}
              className="flipbook-topbar-btn"
              title="Replay 3D Rapid Page Flutter Intro"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              ✦ Replay Flutter Intro
            </button>

            <a
              href="/AI-Agent-Orchestra-Participants-Guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flipbook-topbar-btn"
              title="Download Official 10-Page PDF Guide"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              PDF Guide
            </a>

            <a
              href="/AI-Agent-Orchestra-Participants-Flipbook.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flipbook-topbar-btn"
              title="Open Standalone Offline Reader"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
              Full Window
            </a>
          </div>

          {/* Authentic Untouched Participant Flipbook */}
          <iframe
            src="/AI-Agent-Orchestra-Participants-Flipbook.html"
            title="AI Agent Orchestra — Participant's Guide"
            className="flipbook-iframe"
            allow="autoplay; fullscreen"
          />
        </div>
      ) : (
        /* ========================================================
           ORCHESTRA INTRO: Anime Rapid Page Flutter -> Landing
           ======================================================== */
        <div className="orchestra-viewport">
          {/* Ambient Warm Sunlight Streaming In (Reference Style) */}
          <div className="anime-light-beam" />

          {/* 3D Scene Assembly */}
          <div
            className={`orchestra-scene ${phase}`}
            onClick={handleStageClick}
            role="button"
            tabIndex={0}
            aria-label="Click to land immediately on the cover page"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleStageClick();
            }}
          >
            {/* 3D Book Shadow on Table */}
            <div className="anime-book-shadow" />

            {/* The 3D Book Assembly */}
            <div className="anime-book">
              {/* Outer Hardcover Base */}
              <div className="anime-book-cover-base" />

              {/* Static Left Page Stack (Where Pages Land) */}
              <div className="static-page-left">
                <img src="/assets/participant-page-2.jpg" alt="Welcome" />
                <div className="left-flutter-shadow" />
              </div>

              {/* Static Right Page Stack (Source Base) */}
              <div className="static-page-right">
                <img src="/assets/participant-page-3.jpg" alt="The Score" />
              </div>

              {/* Cascading Fluttering Pages (Right to Left Flutter Stream) */}
              <div className="flutter-leaf leaf-1">
                <img src="/assets/participant-page-3.jpg" alt="The Score" />
                <div className="flutter-sheen" />
              </div>
              <div className="flutter-leaf leaf-2">
                <img src="/assets/participant-page-4.jpg" alt="Movement I" />
                <div className="flutter-sheen" />
              </div>
              <div className="flutter-leaf leaf-3">
                <img src="/assets/participant-page-5.jpg" alt="Movement II" />
                <div className="flutter-sheen" />
              </div>
              <div className="flutter-leaf leaf-4">
                <img src="/assets/participant-page-6.jpg" alt="The Ensemble" />
                <div className="flutter-sheen" />
              </div>
              <div className="flutter-leaf leaf-5">
                <img src="/assets/participant-page-7.jpg" alt="Movement III" />
                <div className="flutter-sheen" />
              </div>
              <div className="flutter-leaf leaf-6">
                <img src="/assets/participant-page-8.jpg" alt="Resources" />
                <div className="flutter-sheen" />
              </div>

              {/* Central Crease Spine */}
              <div className="anime-spine" />

              {/* Final Front Cover Leaf (Lands on top in Phase 3) */}
              <div className="front-cover-leaf">
                <img src="/assets/participant-page-1.jpg" alt="Participant Guide Cover" />
              </div>
            </div>
          </div>

          {/* Interactive Status / Skip Pill */}
          <div className="orchestra-status-pill" onClick={skipToCover}>
            <span className={`speed-dot ${phase === 'rapid' ? 'fast' : 'slowing'}`} />
            <span>
              {phase === 'idle' && '✦ Scroll to begin score flight'}
              {phase === 'rapid' && '✦ Rapid page flutter... Click to settle'}
              {phase === 'slowing' && '✦ Decelerating into orchestra score...'}
              {phase === 'landing' && '✦ Landing smoothly onto cover page...'}
            </span>
          </div>
        </div>
      )}

      {/* Footer Info Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          gap: '12px',
          padding: '0 4px',
          fontSize: '13px',
          color: '#a9acd6'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Coders Club Official Participant Guide</span>
          <span>·</span>
          <span>10-Page Interactive Edition</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/AI-Agent-Orchestra-Participants-Guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#35e4f4',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download PDF Version
          </a>
        </div>
      </div>
    </div>
  );
}
