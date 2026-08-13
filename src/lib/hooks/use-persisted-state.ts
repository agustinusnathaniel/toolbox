import { useCallback, useEffect, useState } from 'react';

function readStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Ignore invalid JSON or localStorage errors
  }
  return defaultValue;
}

function areValuesEqual<T>(first: T, second: T): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  forceValue?: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (forceValue !== undefined) {
      return forceValue;
    }
    // During SSR (and the client's initial hydration) there is no reliable
    // localStorage, so render the default to keep server and client markup
    // identical. The persisted value is adopted in an effect after mount.
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    return readStoredValue(key, defaultValue);
  });

  useEffect(() => {
    if (forceValue !== undefined) {
      // Keep the current reference when callers recreate an equivalent value.
      setState((current) =>
        areValuesEqual(current, forceValue) ? current : forceValue
      );
      return;
    }
    const nextValue = readStoredValue(key, defaultValue);
    // Avoid a render loop when JSON parsing creates a new object or array.
    setState((current) =>
      areValuesEqual(current, nextValue) ? current : nextValue
    );
  }, [defaultValue, forceValue, key]);

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
