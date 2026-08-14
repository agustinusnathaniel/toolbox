import { describe, expect, test } from 'vite-plus/test';

import {
  isSplitViewUsable,
  resolveDiffViewMode,
  SPLIT_VIEW_MIN_WIDTH_PX,
} from './text-diff-view-mode';

describe('isSplitViewUsable', () => {
  test('split is usable at or above the minimum container width', () => {
    expect(isSplitViewUsable(SPLIT_VIEW_MIN_WIDTH_PX)).toBe(true);
    expect(isSplitViewUsable(SPLIT_VIEW_MIN_WIDTH_PX + 1)).toBe(true);
  });

  test('split is not usable below the minimum container width', () => {
    expect(isSplitViewUsable(0)).toBe(false);
    expect(isSplitViewUsable(SPLIT_VIEW_MIN_WIDTH_PX - 1)).toBe(false);
  });
});

describe('resolveDiffViewMode', () => {
  test('keeps the preferred mode when split is usable', () => {
    expect(resolveDiffViewMode('unified', true)).toBe('unified');
    expect(resolveDiffViewMode('split', true)).toBe('split');
  });

  test('falls back to unified when split is not usable, regardless of preference', () => {
    expect(resolveDiffViewMode('unified', false)).toBe('unified');
    expect(resolveDiffViewMode('split', false)).toBe('unified');
  });
});
