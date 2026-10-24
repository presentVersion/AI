import { useState, useEffect } from 'react';

/**
 * Access gating hook for event resources
 * Allows unlocked resources after registration
 */
export function useRegistrationAccess() {
  const [isRegistered, setIsRegistered] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('aio_registered') === 'true';
    } catch {
      return false;
    }
  });

  const register = () => {
    setIsRegistered(true);
    try {
      localStorage.setItem('aio_registered', 'true');
    } catch {
      // ignore storage error
    }
  };

  const reset = () => {
    setIsRegistered(false);
    try {
      localStorage.removeItem('aio_registered');
    } catch {
      // ignore storage error
    }
  };

  return { isRegistered, register, reset };
}
