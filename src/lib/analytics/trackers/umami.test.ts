import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import { createUmamiTracker } from './umami';

const mockUmamiTrack = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
  mockUmamiTrack.mockReset();
  window.umami = undefined;
});

describe('track', () => {
  test('calls window.umami.track with event name and properties', () => {
    window.umami = { identify: vi.fn(), track: mockUmamiTrack };
    const tracker = createUmamiTracker();

    tracker.track({
      name: 'tool_entry',
      properties: { tool_id: 'my-tool', tool_name: 'My Tool' },
    });

    expect(mockUmamiTrack).toHaveBeenCalledWith('tool_entry', {
      tool_id: 'my-tool',
      tool_name: 'My Tool',
    });
  });

  test('calls window.umami.track with name only when no properties', () => {
    window.umami = { identify: vi.fn(), track: mockUmamiTrack };
    const tracker = createUmamiTracker();

    tracker.track({ name: 'test_event' });

    expect(mockUmamiTrack).toHaveBeenCalledWith('test_event', undefined);
  });

  test('no-ops when window.umami is undefined', () => {
    window.umami = undefined;
    const tracker = createUmamiTracker();

    expect(() => tracker.track({ name: 'test_event' })).not.toThrow();
  });
});

describe('page', () => {
  test('calls window.umami.track with callback that sets url and title', () => {
    window.umami = { identify: vi.fn(), track: mockUmamiTrack };
    const tracker = createUmamiTracker();

    tracker.page({ name: 'Home', path: '/' });

    expect(mockUmamiTrack).toHaveBeenCalledTimes(1);

    const callback = mockUmamiTrack.mock.calls[0][0];
    expect(typeof callback).toBe('function');

    const result = callback({ existing: 'prop' });
    expect(result).toEqual({
      existing: 'prop',
      title: 'Home',
      url: '/',
    });
  });

  test('no-ops when window.umami is undefined', () => {
    window.umami = undefined;
    const tracker = createUmamiTracker();

    expect(() => tracker.page({ name: 'Page', path: '/page' })).not.toThrow();
  });
});
