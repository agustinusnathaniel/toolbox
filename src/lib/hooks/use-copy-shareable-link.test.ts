import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import type { Mock } from 'vitest';

import { copyToClipboard } from '@/lib/utils/clipboard';

import { useCopyShareableLink } from './use-copy-shareable-link';

vi.mock('@/lib/utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
}));

const mockedCopy = copyToClipboard as Mock;

beforeEach(() => {
  mockedCopy.mockReset();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin: 'https://example.com',
      pathname: '/tools/password-generator',
      search: '',
    },
  });
});

describe('useCopyShareableLink', () => {
  test('builds params from the provided function and copies the shareable URL', async () => {
    mockedCopy.mockResolvedValue(true);
    const trackAction = vi.fn();
    const buildParams = vi.fn(
      () => new URLSearchParams({ digits: 'true', length: '16' })
    );
    const { result } = renderHook(() =>
      useCopyShareableLink(buildParams, trackAction)
    );

    await act(async () => {
      await result.current();
    });

    expect(buildParams).toHaveBeenCalledTimes(1);
    expect(mockedCopy).toHaveBeenCalledWith(
      'https://example.com/tools/password-generator?digits=true&length=16',
      'Copied Shareable Link'
    );
  });

  test('calls trackAction with copy_link when the copy succeeds', async () => {
    mockedCopy.mockResolvedValue(true);
    const trackAction = vi.fn();
    const { result } = renderHook(() =>
      useCopyShareableLink(() => new URLSearchParams({ a: '1' }), trackAction)
    );

    await act(async () => {
      await result.current();
    });

    expect(trackAction).toHaveBeenCalledWith('copy_link');
  });

  test('does not track when the copy fails', async () => {
    mockedCopy.mockResolvedValue(false);
    const trackAction = vi.fn();
    const { result } = renderHook(() =>
      useCopyShareableLink(() => new URLSearchParams(), trackAction)
    );

    await act(async () => {
      await result.current();
    });

    expect(trackAction).not.toHaveBeenCalled();
  });

  test('omits the query string when params are empty', async () => {
    mockedCopy.mockResolvedValue(true);
    const trackAction = vi.fn();
    const { result } = renderHook(() =>
      useCopyShareableLink(() => new URLSearchParams(), trackAction)
    );

    await act(async () => {
      await result.current();
    });

    expect(mockedCopy).toHaveBeenCalledWith(
      'https://example.com/tools/password-generator',
      'Copied Shareable Link'
    );
  });

  test('tracks a custom action name when provided', async () => {
    mockedCopy.mockResolvedValue(true);
    const trackAction = vi.fn();
    const { result } = renderHook(() =>
      useCopyShareableLink(() => new URLSearchParams(), trackAction, 'share')
    );

    await act(async () => {
      await result.current();
    });

    expect(trackAction).toHaveBeenCalledWith('share');
  });
});
