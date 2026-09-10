import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vite-plus/test';

import { PINNED_TOOLS_STORAGE_KEY } from '@/lib/tools/pinned-tools';

import { usePinnedTools } from './use-pinned-tools';

afterEach(() => {
  localStorage.clear();
});

describe('usePinnedTools', () => {
  test('recovers from a non-array persisted value when toggling', () => {
    localStorage.setItem(PINNED_TOOLS_STORAGE_KEY, JSON.stringify({}));

    const { result } = renderHook(() => usePinnedTools());

    expect(result.current.pinnedSlugs).toEqual([]);

    act(() => {
      result.current.togglePin('base64');
    });

    expect(result.current.pinnedSlugs).toEqual(['base64']);
  });
});
