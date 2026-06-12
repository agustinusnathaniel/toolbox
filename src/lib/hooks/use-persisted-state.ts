import { useCallback, useState } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  forceValue?: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (forceValue !== undefined) {
      return forceValue;
    }
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Ignore invalid JSON or localStorage errors
    }
    return defaultValue;
  });

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore localStorage errors (quota exceeded, etc.)
        }
        return next;
      });
    },
    [key]
  );

  return [state, setPersistedState];
}
