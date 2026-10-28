import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Dialog from './Dialog';
import { useSound } from '../hooks/useSound';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Prologue({ isIgnited }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(true);
  const reduceMotion = useReducedMotion();
  const { playTick, playEnterPt2 } = useSound();

  const [dialogText, setDialogText] = useState('Welcome to the orchestra.');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isIgnited) return;

    playEnterPt2();

    const video = videoRef.current;
    if (video && !reduceMotion) {
      video.play().catch(() => {});
    }

    if (reduceMotion) {
      setDialogText('A one-day event to educate students and make them aware of agentic development.');
      return;
    }

    // Sequence the prologue reveals
    const tl = gsap.timeline();

    tl.fromTo(
      '.prologue-title, .prologue-badge, .prologue-lede',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    )
    .fromTo(
      '.prologue-art',
      { autoAlpha: 0, scale: 0.94 },
      { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(
      '.scroll-cue',
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    // Type out the second sentence after a moment
    const timeout = setTimeout(() => {
      const fullText = 'A one-day event to educate students and make them aware of agentic development.';
      setIsTyping(true);
      let idx = 0;
      const typer = setInterval(() => {
        idx += 1;
        setDialogText(fullText.slice(0, idx));
        if (idx % 3 === 0) playTick();
        if (idx >= fullText.length) {
          clearInterval(typer);
          setIsTyping(false);
        }
      }, 30);
    }, 2400);

    return () => {
      tl.kill();
      clearTimeout(timeout);
    };
  }, [isIgnited, reduceMotion, playTick, playEnterPt2]);

  return (
    <header id="prologue" ref={containerRef}>
      <div className="prologue-wrap">
        <div className="prologue-art">
          {hasVideo && !reduceMotion ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/hero-poster.jpg"
              onError={() => setHasVideo(false)}
              className="prologue-video"
            >
              <source src="/assets/hero-loop.webm" type="video/webm" />
              <source src="/assets/hero-loop.mp4" type="video/mp4" />
              <img
                src="/assets/hero-art.jpg"
                alt="A conductor leading an orchestra while streams of code flow around the musicians"
                className="prologue-img"
              />
            </video>
          ) : (
            <img
              src="/assets/hero-art.jpg"
              alt="A conductor leading an orchestra while streams of code flow around the musicians"
              className="prologue-img"
            />
          )}
        </div>

        <div className="prologue-content">
          <span className="prologue-badge">
            <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
            </svg>
            Coders Club presents
          </span>

          <h1 className="prologue-title">
            AI Agent<br />Orchestra
          </h1>

          <p className="prologue-lede">
            Learn how AI tools, chatbots and agents differ, then build and conduct an AI agent of your own. One day, three movements.
          </p>
        </div>
      </div>

      <Dialog
        className="prologue-dialog"
        speaker="The Conductor"
        text={dialogText}
        displayedText={dialogText}
        typing={isTyping}
      />

      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll to begin Movement I</span>
        <svg className="scroll-cue-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </header>
  );
}
