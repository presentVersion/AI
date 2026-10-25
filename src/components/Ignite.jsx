import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useSound } from '../hooks/useSound';
import { useHold } from '../hooks/useHold';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Ignite({ onIgniteComplete }) {
  const {
    muted,
    toggleMute,
    playCharge,
    stopCharge,
    playSlash,
    playEnter,
    playUiConfirm,
    startBackgroundMusic
  } = useSound();

  const reduceMotion = useReducedMotion();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ringBtnRef = useRef(null);
  const lightFloodRef = useRef(null);
  const ripplesRef = useRef([]);
  const lastRippleTimeRef = useRef(0);
  const [ignited, setIgnited] = useState(false);

  const getRingCenter = useCallback(() => {
    if (ringBtnRef.current) {
      const rect = ringBtnRef.current.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.65 };
  }, []);

  // Trigger radial light flood & transition into Prologue
  const triggerIgnition = useCallback((origin) => {
    setIgnited(true);
    playSlash();

    const center = getRingCenter();
    const x = origin?.x ?? center.x;
    const y = origin?.y ?? center.y;
    const xPct = Math.round((x / window.innerWidth) * 100);
    const yPct = Math.round((y / window.innerHeight) * 100);

    const flood = lightFloodRef.current;
    if (flood) {
      flood.style.setProperty('--origin-x', `${xPct}%`);
      flood.style.setProperty('--origin-y', `${yPct}%`);
    }

    // Start background soundtrack: Enter Pharloom
    startBackgroundMusic(0.45);

    if (reduceMotion) {
      onIgniteComplete?.();
      return;
    }

    // 120ms freeze before explosive radial light flood
    setTimeout(() => {
      playEnter();

      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem('aio_ignited', '1');
          } catch {
            // ignore storage warning
          }
        }
      });

      tl.to(flood, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.in'
      })
      .fromTo(
        flood,
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        {
          clipPath: `circle(${maxRadius * 1.3}px at ${x}px ${y}px)`,
          duration: 0.6,
          ease: 'power3.out',
          onStart: () => {
            setTimeout(() => onIgniteComplete?.(), 250);
          }
        }
      )
      .to(containerRef.current, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power1.inOut'
      }, '-=0.15');
    }, 120);
  }, [playSlash, playEnter, startBackgroundMusic, reduceMotion, onIgniteComplete, getRingCenter]);

  // Press-and-hold engine with sound and ripple hookups
  const { progress, isHolding, bind, reset } = useHold({
    durationSec: 1.8,
    reverseSec: 0.4,
    onStart: () => {
      playCharge();
      // Ensure audio context and background music are primed
      startBackgroundMusic(0.2);
    },
    onCancel: () => {
      stopCharge();
    },
    onProgress: (p, ptr) => {
      // ONLY spawn concentric ripples when actually holding and charge > 0
      if (!isHolding || p <= 0) return;

      const center = getRingCenter();
      const now = performance.now();
      const interval = Math.max(130, 260 - p * 130);

      if (now - lastRippleTimeRef.current > interval) {
        lastRippleTimeRef.current = now;
        if (ripplesRef.current.length < 14) {
          ripplesRef.current.push({
            x: center.x,
            y: center.y,
            r: 70, // Start right at the edge of the 140px button
            maxR: Math.min(window.innerWidth, window.innerHeight) * (0.6 + p * 0.5),
            alpha: 0.85,
            speed: 4 + p * 7,
            color: p > 0.7 ? '#ffffff' : p > 0.35 ? '#8b5cf6' : '#2fd6e8'
          });
        }
      }
    },
    onComplete: (ptr) => {
      stopCharge(50);
      triggerIgnition(getRingCenter());
    }
  });

  // Canvas additive concentric ripples rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (ripplesRef.current.length > 0) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const rip = ripplesRef.current[i];
          rip.r += rip.speed;
          rip.alpha *= 0.94;

          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
          ctx.strokeStyle = rip.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = rip.alpha;
          ctx.stroke();

          if (rip.alpha <= 0.01 || rip.r >= rip.maxR) {
            ripplesRef.current.splice(i, 1);
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSkip = (e) => {
    e.stopPropagation();
    playUiConfirm();
    triggerIgnition(getRingCenter());
  };

  const handleSoundToggleClick = (e) => {
    e.stopPropagation();
    playUiConfirm();
    toggleMute();
  };

  return (
    <section id="ignite" ref={containerRef} {...bind}>
      <canvas id="ignite-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="ignite-light-flood" ref={lightFloodRef} aria-hidden="true" />

      {/* Header */}
      <div className="ignite-header">
        <p className="ignite-brand">Coders Club Presents</p>
        <h1 className="ignite-title">AI Agent Orchestra</h1>
        <p className="ignite-subtitle">A 3-Day Cinematic Odyssey into Agentic AI</p>
      </div>

      {/* Center Thumb Zone Button with Concentric Rings */}
      <div className="ignite-trigger-zone">
        <div className="ignite-ring-container">
          <svg className="ignite-ring-svg" viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2fd6e8" />
                <stop offset="60%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            {/* Background concentric faint guide ring */}
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="2.5"
            />
            {/* Concentric progress charge ring */}
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="465"
              strokeDashoffset={465 * (1 - Math.max(0, Math.min(1, progress)))}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.03s linear' }}
            />
          </svg>

          <button
            ref={ringBtnRef}
            type="button"
            className={`ignite-ring-btn ${isHolding ? 'holding' : ''}`}
            aria-label={reduceMotion ? 'Begin Experience' : 'Press and hold to ignite the orchestra'}
            tabIndex={0}
          >
            <div className="ignite-core-glow" aria-hidden="true" />
            <span className="ignite-action-text">
              {reduceMotion ? 'Begin' : isHolding ? 'Igniting...' : 'Press & Hold'}
            </span>
            <span className="ignite-action-sub">
              {reduceMotion ? 'Tap to start' : 'Hold thumb to enter'}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Controls: Sound & Skip */}
      <div className="ignite-footer">
        <button
          type="button"
          className="btn"
          style={{ fontSize: '13px', padding: '6px 14px' }}
          onClick={handleSoundToggleClick}
        >
          {muted ? 'Sound: Off' : 'Sound: On'}
        </button>

        <button
          type="button"
          className="ignite-skip-btn"
          onClick={handleSkip}
        >
          Skip intro →
        </button>
      </div>
    </section>
  );
}
