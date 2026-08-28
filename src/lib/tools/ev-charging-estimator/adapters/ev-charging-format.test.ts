import { describe, expect, test } from 'vite-plus/test';

import { formatTime } from './ev-charging';

describe('formatTime', () => {
  test('formats hours and minutes', () => {
    expect(formatTime(1.5)).toBe('1h 30m');
  });

  test('formats exact hours', () => {
    expect(formatTime(3)).toBe('3h');
  });

  test('formats minutes only', () => {
    expect(formatTime(0.5)).toBe('30m');
  });

  test('formats zero', () => {
    expect(formatTime(0)).toBe('0m');
  });

  test('formats fractional minutes', () => {
    expect(formatTime(2.75)).toBe('2h 45m');
  });
});
