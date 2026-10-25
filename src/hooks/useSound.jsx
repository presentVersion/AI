import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('aio_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [unlocked, setUnlocked] = useState(false);
  const bgMusicRef = useRef(null);
  const chargeSoundRef = useRef(null);
  const slashSoundRef = useRef(null);
  const enterSoundRef = useRef(null);
  const enterPt2SoundRef = useRef(null);
  const uiConfirmSoundRef = useRef(null);
  const audioCtxRef = useRef(null);
  const currentIntensityRef = useRef(0.4);

  // Initialize Howler global mute
  useEffect(() => {
    Howler.mute(muted);
  }, [muted]);

  // Audio unlock helper for mobile (iOS Safari / Android Chrome)
  const unlockAudio = useCallback(() => {
    if (unlocked) return;

    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().catch(() => {});
    }

    // Native Web Audio Context for synthesized ticks & unlock
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }

    setUnlocked(true);
  }, [unlocked]);

  // Background Music Controls
  const startBackgroundMusic = useCallback((targetVol = 0.45) => {
    unlockAudio();
    const bg = bgMusicRef.current;
    if (!bg) return;

    currentIntensityRef.current = targetVol;
    if (!bg.playing()) {
      bg.play();
    }
    bg.fade(bg.volume(), targetVol, 1500);
  }, [unlockAudio]);

  const stopBackgroundMusic = useCallback((fadeMs = 800) => {
    const bg = bgMusicRef.current;
    if (!bg) return;
    bg.fade(bg.volume(), 0, fadeMs);
    setTimeout(() => {
      if (bg.volume() === 0) bg.pause();
    }, fadeMs);
  }, []);

  // Listen for first interaction to unlock audio and resume background music
  useEffect(() => {
    const handleFirstTouch = () => {
      unlockAudio();
      try {
        if (sessionStorage.getItem('aio_ignited') === '1') {
          startBackgroundMusic(0.45);
        }
      } catch {}
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };

    window.addEventListener('pointerdown', handleFirstTouch, { passive: true });
    window.addEventListener('keydown', handleFirstTouch, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, [unlockAudio, startBackgroundMusic]);

  // Handle visibility change (pause on tab switch/lock screen, resume on focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        Howler.mute(true);
      } else {
        Howler.mute(muted);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [muted]);

  // Lazy-load sounds after unlock or on demand
  useEffect(() => {
    // 1. Background Music: Enter Pharloom
    bgMusicRef.current = new Howl({
      src: ['/audio/enter-pharloom.mp3', '/audio/01. Enter Pharloom.mp3'],
      html5: true, // stream large 4.7MB file smoothly
      loop: true,
      volume: 0,
      preload: true
    });

    // 2. Dream charge (tap and hold)
    chargeSoundRef.current = new Howl({
      src: ['/audio/dream-charge.wav'],
      loop: true,
      volume: 0.65,
      preload: true
    });

    // 3. Dream slash (ignition downbeat hit)
    slashSoundRef.current = new Howl({
      src: ['/audio/dream-slash.wav'],
      volume: 0.85,
      preload: true
    });

    // 4. Dream enter (radial light flood)
    enterSoundRef.current = new Howl({
      src: ['/audio/dream-enter.wav'],
      volume: 0.8,
      preload: true
    });

    // 5. Dream enter part 2 (prologue & scene reveal)
    enterPt2SoundRef.current = new Howl({
      src: ['/audio/dream-enter-pt2.wav'],
      volume: 0.75,
      preload: true
    });

    // 6. UI Button Confirm
    uiConfirmSoundRef.current = new Howl({
      src: ['/audio/ui-confirm.wav'],
      volume: 0.55,
      preload: true
    });

    return () => {
      try {
        bgMusicRef.current?.unload();
        chargeSoundRef.current?.unload();
        slashSoundRef.current?.unload();
        enterSoundRef.current?.unload();
        enterPt2SoundRef.current?.unload();
        uiConfirmSoundRef.current?.unload();
      } catch (e) {
        console.warn('Error unloading audio:', e);
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aio_muted', String(next));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      Howler.mute(next);
      return next;
    });
  }, []);

  const setBackgroundIntensity = useCallback((level) => {
    // level: 1 (Movement I) -> 0.40, 2 (Movement II) -> 0.60, 3 (Movement III) -> 0.85
    let targetVol = 0.45;
    if (level === 1) targetVol = 0.42;
    else if (level === 2) targetVol = 0.65;
    else if (level === 3) targetVol = 0.85;
    else if (typeof level === 'number') targetVol = Math.max(0.1, Math.min(1.0, level));

    currentIntensityRef.current = targetVol;
    const bg = bgMusicRef.current;
    if (bg && bg.playing()) {
      bg.fade(bg.volume(), targetVol, 1200);
    }
  }, []);

  // Duck background music for dramatic stingers
  const duckBackground = useCallback((duckRatio = 0.4, restoreMs = 1200) => {
    const bg = bgMusicRef.current;
    if (!bg || !bg.playing()) return;
    const base = currentIntensityRef.current;
    bg.fade(bg.volume(), base * duckRatio, 150);
    setTimeout(() => {
      if (bg && bg.playing()) {
        bg.fade(bg.volume(), base, 800);
      }
    }, restoreMs);
  }, []);

  // Stinger Triggers
  const playCharge = useCallback(() => {
    unlockAudio();
    const sound = chargeSoundRef.current;
    if (sound && !sound.playing()) {
      sound.play();
      sound.fade(0, 0.7, 300);
    }
  }, [unlockAudio]);

  const stopCharge = useCallback((fadeMs = 250) => {
    const sound = chargeSoundRef.current;
    if (sound && sound.playing()) {
      sound.fade(sound.volume(), 0, fadeMs);
      setTimeout(() => {
        if (sound.volume() === 0) sound.stop();
      }, fadeMs);
    }
  }, []);

  const playSlash = useCallback(() => {
    unlockAudio();
    duckBackground(0.3, 1400);
    slashSoundRef.current?.play();
  }, [unlockAudio, duckBackground]);

  const playEnter = useCallback(() => {
    unlockAudio();
    duckBackground(0.35, 1800);
    enterSoundRef.current?.play();
  }, [unlockAudio, duckBackground]);

  const playEnterPt2 = useCallback(() => {
    unlockAudio();
    duckBackground(0.4, 1500);
    enterPt2SoundRef.current?.play();
  }, [unlockAudio, duckBackground]);

  const playUiConfirm = useCallback(() => {
    unlockAudio();
    uiConfirmSoundRef.current?.play();
  }, [unlockAudio]);

  // Synthesized typewriter tick (zero latency, high precision, no TTS)
  const playTick = useCallback(() => {
    if (muted) return;
    try {
      const ctx = audioCtxRef.current || Howler.ctx;
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      // Subtle warm organic acoustic tick (like mechanical key / soft metronome tick)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.022);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Audio context might be restricted
    }
  }, [muted]);

  const value = {
    muted,
    toggleMute,
    unlockAudio,
    startBackgroundMusic,
    stopBackgroundMusic,
    setBackgroundIntensity,
    playCharge,
    stopCharge,
    playSlash,
    playEnter,
    playEnterPt2,
    playUiConfirm,
    playTick
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
