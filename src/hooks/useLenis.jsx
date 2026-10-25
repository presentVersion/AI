import { useEffect, useRef, createContext, useContext, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext(null);

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Phones keep native momentum with syncTouch: false
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const rafTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(rafTicker);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });

    return () => {
      gsap.ticker.remove(rafTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    document.body.style.overflow = 'hidden';
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
    document.body.style.overflow = '';
  }, []);

  const scrollTo = useCallback((target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options.offset ?? 0,
        duration: options.duration ?? 1.2,
        easing: options.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
        ...options
      });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const value = {
    lenis: lenisRef.current,
    stop,
    start,
    scrollTo
  };

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  const ctx = useContext(LenisContext);
  return ctx || {
    lenis: null,
    stop: () => {},
    start: () => {},
    scrollTo: (t) => {
      const el = typeof t === 'string' ? document.querySelector(t) : t;
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };
}
