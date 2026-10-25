import { useState, useEffect } from 'react';

/**
 * Hook to detect prefers-reduced-motion media query
 */
export function useReducedMotion() {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setMatches(e.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        mq.removeListener(onChange);
      }
    };
  }, []);

  return matches;
}
