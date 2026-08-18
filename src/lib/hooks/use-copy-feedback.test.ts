import { act, renderHook } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test';
import type { Mock } from 'vitest';

import { copyToClipboard } from '@/lib/utils/clipboard';

import { useCopyFeedback } from './use-copy-feedback';

vi.mock('@/lib/utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

const mockedCopy = copyToClipboard as Mock;

const FEEDBACK_DURATION_MS = 1500;

beforeEach(() => {
  mockedCopy.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCopyFeedback', () => {
  test('copy sets copiedKey to the provided key on success', async () => {
    mockedCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('hello', 'copy');
    });

    expect(result.current.copiedKey).toBe('copy');
  });

  test('copy returns true on success and false on failure', async () => {
    mockedCopy.mockResolvedValueOnce(true);
    mockedCopy.mockResolvedValueOnce(false);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await expect(result.current.copy('hello', 'copy')).resolves.toBe(true);
    });
    await act(async () => {
      await expect(result.current.copy('hello', 'copy')).resolves.toBe(false);
    });
  });

  test('copy does not set copiedKey when the clipboard write fails', async () => {
    mockedCopy.mockResolvedValue(false);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('hello', 'copy');
    });

    expect(result.current.copiedKey).toBeNull();
  });

  test('copiedKey resets to null after the feedback duration', async () => {
    vi.useFakeTimers();
    mockedCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('hello', 'copy');
    });
    expect(result.current.copiedKey).toBe('copy');

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });

    expect(result.current.copiedKey).toBeNull();
  });

  test('clears the pending timer on unmount', async () => {
    vi.useFakeTimers();
    mockedCopy.mockResolvedValue(true);
    const { result, unmount } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('hello', 'copy');
    });

    act(() => {
      unmount();
    });

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS);
    });

    expect(result.current.copiedKey).toBe('copy');
  });

  test('rapid copies restart the timer so only the last key stays active', async () => {
    vi.useFakeTimers();
    mockedCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback());

    await act(async () => {
      await result.current.copy('first', 'first');
    });
    await act(async () => {
      await result.current.copy('second', 'second');
    });

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS - 100);
    });
    expect(result.current.copiedKey).toBe('second');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.copiedKey).toBeNull();
  });

  test('supports number keys through the generic type parameter', async () => {
    mockedCopy.mockResolvedValue(true);
    const { result } = renderHook(() => useCopyFeedback<number>());

    await act(async () => {
      await result.current.copy('hello', 3);
    });

    expect(result.current.copiedKey).toBe(3);
  });
});
