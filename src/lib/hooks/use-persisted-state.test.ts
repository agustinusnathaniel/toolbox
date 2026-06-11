import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { usePersistedState } from './use-persisted-state';

afterEach(() => {
  localStorage.clear();
});

describe('usePersistedState', () => {
  test('returns default value when no stored value exists', () => {
    const { result } = renderHook(() =>
      usePersistedState('test-key', 'default')
    );
    expect(result.current[0]).toBe('default');
  });

  test('returns stored value when it exists in localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() =>
      usePersistedState('test-key', 'default')
    );
    expect(result.current[0]).toBe('stored');
  });

  test('persists value to localStorage on update', () => {
    const { result } = renderHook(() =>
      usePersistedState('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key') ?? '')).toBe('updated');
  });

  test('supports functional updates', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  test('handles complex objects', () => {
    const defaultObj = { name: 'test', count: 0 };
    const { result } = renderHook(() =>
      usePersistedState('test-key', defaultObj)
    );

    act(() => {
      result.current[1]({ name: 'updated', count: 5 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
  });

  test('returns default value for invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'not-valid-json{');
    const { result } = renderHook(() =>
      usePersistedState('test-key', 'fallback')
    );
    expect(result.current[0]).toBe('fallback');
  });
});
