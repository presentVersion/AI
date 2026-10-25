import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSound } from '../hooks/useSound';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const SCENE_DATA = {
  1: {
    id: 'scene1',
    movement: 'Movement I',
    dayTitle: 'Day 1 · Learn + Create',
    headline: 'From Prompt to Portfolio',
    duration: 'First half-day, about 3 hours (proposed)',
    terminalPath: 'conductor@orchestra:~/movement-1$',
    lines: [
      'Every instrument in this hall is an AI tool — LLMs, generative UI, and coding agents.',
      'First, you will learn to speak their language: precision prompting that bends raw models to your exact intent.',
      'Next, the recreation challenge: take a modern web interface, deconstruct its patterns, and rebuild it in minutes.',
      'By sundown, your own personal developer portfolio is compiled, styled, and deployed live to the web.',
      'Your first movement concludes. The instruments fall quiet — and your portfolio plays.'
    ]
  },
  2: {
    id: 'scene2',
    movement: 'Movement II',
    dayTitle: 'Day 2 · Understand + Connect',
    headline: 'From Chatbot to Agent',
    duration: 'About 2 hours (proposed)',
    terminalPath: 'conductor@orchestra:~/movement-2$',
    lines: [
      'A chatbot answers when spoken to. An agent perceives, decides, and acts on its own.',
      'The anatomy of agency: Trigger. Model reasoning. Tool invocation. Autonomous action.',
      'Watch the wires ignite as we connect webhooks, visual workflows in n8n, and external APIs into a unified nervous system.',
      'You will run a live multi-step agent experiment — watching real data flow autonomously from prompt to production.',
      'The orchestra harmonizes. You are no longer just prompting an AI — you are conducting an agentic orchestra.'
    ]
  },
  3: {
    id: 'scene3',
    movement: 'Movement III',
    dayTitle: 'Day 3 · Build + Present',
    headline: 'Conduct Your Own AI Agent',
    duration: 'Full day hackathon (proposed)',
    terminalPath: 'conductor@orchestra:~/movement-3$',
    lines: [
      'The grand finale begins. Now, the baton is placed directly into your hands.',
      'Assemble your ensemble. Choose a real problem, architect your agentic workflow, and divide the execution.',
      'A full-day hackathon: build the user interface, wire the backend autonomous agents, and stress-test the pipeline.',
      'When the clock stops, take the stage. Demonstrate what the AI automates live, and explain what is still simulated.',
      'Conductor, the hall is silent. The spotlight is yours. Step forward and conduct your AI agent.'
    ]
  }
};

export default function Scene({ day = 1 }) {
  const data = SCENE_DATA[day] || SCENE_DATA[1];
  const totalBeats = data.lines.length;

  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  const [activeBeat, setActiveBeat] = useState(0);
  const [typedText, setTypedText] = useState(data.lines[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const lastCharLenRef = useRef(0);
  const { setBackgroundIntensity, playTick, playEnterPt2, playUiConfirm } = useSound();
  const reduceMotion = useReducedMotion();

  // ScrollTrigger timeline that drives typing, holding, clearing, and advancing
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (reduceMotion) {
      setTypedText(data.lines[totalBeats - 1]);
      setActiveBeat(totalBeats - 1);
      return;
    }

    const ctx = gsap.context(() => {
      // Pin scene across 3.2 viewport heights for generous, comfortable reading & typing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: `+=${totalBeats * 85}%`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onEnter: () => {
            setBackgroundIntensity(day);
            playEnterPt2();
          },
          onEnterBack: () => {
            setBackgroundIntensity(day);
          }
        }
      });

      // Liquid glass card floating breath
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          { y: 15, scale: 0.99 },
          { y: -15, scale: 1.01, ease: 'sine.inOut' },
          0
        );
      }

      // Drive dialogue: Type -> Hold -> Clear -> Next Line
      const scrollObj = { progress: 0 };
      const maxScroll = totalBeats - 0.01;

      tl.to(scrollObj, {
        progress: maxScroll,
        ease: 'none',
        onUpdate: () => {
          if (replaying) return;

          const p = scrollObj.progress;
          const beatIdx = Math.min(totalBeats - 1, Math.floor(p));
          const frac = p - beatIdx; // 0.0 to 1.0 within beat
          const lineText = data.lines[beatIdx];

          setActiveBeat(beatIdx);

          let currentText = '';
          const isFinalBeat = beatIdx === totalBeats - 1;

          if (beatIdx === 0) {
            // Beat 1: Fully visible immediately on arrival, then clears as you scroll to Beat 2
            if (frac < 0.65) {
              setIsTyping(false);
              currentText = lineText;
            } else if (frac < 0.95) {
              // Terminal backspace clearing effect
              setIsTyping(true);
              const clearRatio = (frac - 0.65) / 0.30;
              const remaining = Math.round((1 - clearRatio) * lineText.length);
              currentText = lineText.slice(0, Math.max(0, remaining));
            } else {
              setIsTyping(true);
              currentText = '';
            }
          } else if (isFinalBeat) {
            // Final beat: Types in and stays permanently held
            if (frac < 0.45) {
              setIsTyping(true);
              const chars = Math.round((frac / 0.45) * lineText.length);
              currentText = lineText.slice(0, Math.max(0, chars));
            } else {
              setIsTyping(false);
              currentText = lineText;
            }
          } else {
            // Intermediate beats: Type in (0-38%) -> Hold (38-78%) -> Clear (78-96%) -> Blank (96-100%)
            if (frac < 0.38) {
              setIsTyping(true);
              const chars = Math.round((frac / 0.38) * lineText.length);
              currentText = lineText.slice(0, Math.max(0, chars));
            } else if (frac < 0.78) {
              setIsTyping(false);
              currentText = lineText;
            } else if (frac < 0.96) {
              setIsTyping(true);
              const clearRatio = (frac - 0.78) / 0.18;
              const remaining = Math.round((1 - clearRatio) * lineText.length);
              currentText = lineText.slice(0, Math.max(0, remaining));
            } else {
              setIsTyping(true);
              currentText = '';
            }
          }

          // Trigger mechanical typewriter tick audio on character increments
          if (Math.abs(currentText.length - lastCharLenRef.current) >= 2) {
            lastCharLenRef.current = currentText.length;
            if (currentText.length > 0) playTick();
          }

          setTypedText(currentText);
        }
      }, 0);
    }, el);

    return () => ctx.revert();
  }, [day, data, totalBeats, reduceMotion, replaying, setBackgroundIntensity, playTick, playEnterPt2]);

  // Interactive Replay: Tap dialogue box to replay current beat
  const handleReplayClick = useCallback(() => {
    playUiConfirm();
    setReplaying(true);
    setTypedText('');
    setIsTyping(true);

    const fullText = data.lines[activeBeat];
    let charIdx = 0;

    const interval = setInterval(() => {
      charIdx += 1;
      setTypedText(fullText.slice(0, charIdx));
      if (charIdx % 3 === 0) playTick();

      if (charIdx >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
        setReplaying(false);
      }
    }, 24);
  }, [data.lines, activeBeat, playUiConfirm, playTick]);

  return (
    <section className="scene" id={data.id} ref={sectionRef}>
      {/* 
        Ultra-Refined Liquid Glass Story Card:
        Translucent morphism so live glowing GhostFibers undulate directly through the glass.
        Header is integrated INSIDE the card to ensure it is never cut off or occluded by nav.
      */}
      <div className="scene-story-card" ref={cardRef}>
        {/* Specular Liquid Top Glow Line */}
        <div className="glass-specular-highlight" aria-hidden="true" />

        {/* Card Movement Header */}
        <div className="scene-card-header">
          <div className="scene-header-badges">
            <span className="scene-badge movement">{data.movement}</span>
            <span className="scene-badge-separator">·</span>
            <span className="scene-badge day">{data.dayTitle}</span>
            <span className="scene-badge duration">{data.duration}</span>
          </div>

          <h2 className="scene-card-headline">{data.headline}</h2>
        </div>

        {/* Terminal Dialogue Box: Types, Holds, and Clears Line-by-Line */}
        <div
          className="scene-terminal-box"
          onClick={handleReplayClick}
          title="Tap to replay this dialogue beat"
          role="region"
          aria-live="polite"
          aria-label={`Movement ${day} dialogue: ${data.lines[activeBeat]}`}
        >
          {/* Terminal Window Header Bar */}
          <div className="scene-terminal-header">
            <div className="terminal-dots" aria-hidden="true">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
            </div>

            <span className="terminal-path">{data.terminalPath}</span>

            <span className="terminal-beat-pill">
              Beat {activeBeat + 1} / {totalBeats}
            </span>
          </div>

          {/* Terminal Dialogue Content */}
          <div className="scene-terminal-content">
            <div className="terminal-speaker-tag">
              <span className="speaker-pulse" aria-hidden="true" />
              <b className="speaker-name">The Conductor</b>
            </div>

            <p className="scene-terminal-text">
              {typedText}
              <span className={`terminal-cursor ${isTyping ? 'active' : 'idle'}`} aria-hidden="true">
                ▋
              </span>
            </p>

            <div className="scene-terminal-footer">
              <span className="terminal-scroll-hint">
                {activeBeat < totalBeats - 1 ? '↓ Scroll down to continue narration' : '✦ Movement score complete'}
              </span>
              <span className="terminal-replay-btn">Tap to replay</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
