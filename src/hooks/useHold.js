import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

/**
 * useHold - Press-and-hold progress engine for pointer & keyboard interactions
 * Smooth charge over `durationSec` (default 1.8s) and smooth reversal over 400ms on early release.
 */
export function useHold({
  durationSec = 1.8,
  reverseSec = 0.4,
  onStart,
  onCancel,
  onComplete,
  onProgress
} = {}) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const isHoldingRef = useRef(false);
  const chargeRef = useRef(0);
  const doneRef = useRef(false);
  const ptrRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastVibrateRef = useRef(0);

  const startHold = useCallback((e) => {
    if (doneRef.current) return;
    isHoldingRef.current = true;
    setIsHolding(true);

    if (e && typeof e.clientX === 'number') {
      ptrRef.current = { x: e.clientX, y: e.clientY };
    }

    onStart?.(ptrRef.current);
  }, [onStart]);

  const cancelHold = useCallback(() => {
    if (doneRef.current) return;
    isHoldingRef.current = false;
    setIsHolding(false);
    onCancel?.();
  }, [onCancel]);

  const reset = useCallback(() => {
    isHoldingRef.current = false;
    doneRef.current = false;
    chargeRef.current = 0;
    setIsHolding(false);
    setProgress(0);
  }, []);

  // GSAP Ticker for 60fps frame-rate independent charge / reversal
  useEffect(() => {
    const update = (time, deltaTime) => {
      if (doneRef.current) return;

      const dt = (deltaTime || 16.6) / 1000;
      let next = chargeRef.current;

      if (isHoldingRef.current) {
        next += dt / durationSec;
      } else {
        next -= dt / reverseSec;
      }

      next = Math.max(0, Math.min(1, next));
      chargeRef.current = next;
      setProgress(next);
      if (isHoldingRef.current || next > 0) {
        onProgress?.(next, ptrRef.current);
      }

      // Progressive haptics on Android
      if (isHoldingRef.current && next > 0.15 && typeof navigator !== 'undefined' && navigator.vibrate) {
        const now = performance.now();
        const interval = Math.max(80, 260 - next * 180);
        if (now - lastVibrateRef.current > interval) {
          lastVibrateRef.current = now;
          navigator.vibrate(Math.round(8 + next * 14));
        }
      }

      if (next >= 1 && !doneRef.current) {
        doneRef.current = true;
        isHoldingRef.current = false;
        setIsHolding(false);
        onComplete?.(ptrRef.current);
      }
    };

    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [durationSec, reverseSec, onProgress, onComplete]);

  // Pointer & keyboard event bindings
  const bind = {
    onPointerDown: (e) => {
      // Primary mouse button or touch
      if (e.button !== undefined && e.button !== 0) return;
      startHold(e);
    },
    onPointerUp: () => cancelHold(),
    onPointerCancel: () => cancelHold(),
    onPointerLeave: () => {
      // Only cancel if holding was triggered on element directly
      if (isHoldingRef.current) cancelHold();
    },
    onKeyDown: (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        startHold({ clientX: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
    },
    onKeyUp: (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        cancelHold();
      }
    }
  };

  return {
    progress,
    isHolding,
    bind,
    reset,
    ptr: ptrRef.current,
    isDone: doneRef.current
  };
}
