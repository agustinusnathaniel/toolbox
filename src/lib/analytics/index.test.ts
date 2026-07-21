import { afterEach, describe, expect, test, vi } from 'vite-plus/test';

import type { AnalyticsTracker } from './index';
import {
  analytics,
  trackToolAction,
  trackToolCompletion,
  trackToolEntry,
} from './index';

function createMockTracker() {
  return {
    page: vi.fn() as unknown as AnalyticsTracker['page'],
    track: vi.fn() as unknown as AnalyticsTracker['track'],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('analytics.addTracker', () => {
  test('returns an unsubscribe function', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    expect(typeof unsubscribe).toBe('function');

    unsubscribe();
  });

  test('unsubscribed tracker no longer receives events', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    unsubscribe();
    analytics.track({ name: 'test' });

    expect(tracker.track).not.toHaveBeenCalled();
  });
});

describe('analytics.track', () => {
  test('enriches event with timestamp', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    const now = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);

    analytics.track({ name: 'test_event' });

    expect(tracker.track).toHaveBeenCalledWith({
      name: 'test_event',
      timestamp: now,
    });

    unsubscribe();
  });

  test('preserves existing timestamp', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    analytics.track({ name: 'test_event', timestamp: 123 });

    expect(tracker.track).toHaveBeenCalledWith({
      name: 'test_event',
      timestamp: 123,
    });

    unsubscribe();
  });

  test('passes properties through', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    analytics.track({
      name: 'test_event',
      properties: { count: 42, key: 'value' },
    });

    expect(tracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: { count: 42, key: 'value' },
      })
    );

    unsubscribe();
  });

  test('fans out to multiple trackers', () => {
    const tracker1 = createMockTracker();
    const tracker2 = createMockTracker();
    const unsub1 = analytics.addTracker(tracker1);
    const unsub2 = analytics.addTracker(tracker2);

    analytics.track({ name: 'test_event' });

    expect(tracker1.track).toHaveBeenCalledTimes(1);
    expect(tracker2.track).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });

  test('silently ignores tracker errors', () => {
    const badTracker = {
      page: vi.fn() as unknown as AnalyticsTracker['page'],
      track: (() => {
        throw new Error('tracker exploded');
      }) as AnalyticsTracker['track'],
    };
    const goodTracker = createMockTracker();
    const unsub1 = analytics.addTracker(badTracker);
    const unsub2 = analytics.addTracker(goodTracker);

    expect(() => analytics.track({ name: 'test_event' })).not.toThrow();
    expect(goodTracker.track).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });

  test('does nothing when no trackers registered', () => {
    expect(() => analytics.track({ name: 'test_event' })).not.toThrow();
  });
});

describe('analytics.page', () => {
  test('calls tracker.page with name and path', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    analytics.page({ name: 'Home', path: '/' });

    expect(tracker.page).toHaveBeenCalledWith({ name: 'Home', path: '/' });

    unsubscribe();
  });

  test('fans out to multiple trackers', () => {
    const tracker1 = createMockTracker();
    const tracker2 = createMockTracker();
    const unsub1 = analytics.addTracker(tracker1);
    const unsub2 = analytics.addTracker(tracker2);

    analytics.page({ name: 'Page', path: '/page' });

    expect(tracker1.page).toHaveBeenCalledTimes(1);
    expect(tracker2.page).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });

  test('silently ignores tracker errors', () => {
    const badTracker = {
      page: (() => {
        throw new Error('tracker exploded');
      }) as AnalyticsTracker['page'],
      track: vi.fn() as unknown as AnalyticsTracker['track'],
    };
    const goodTracker = createMockTracker();
    const unsub1 = analytics.addTracker(badTracker);
    const unsub2 = analytics.addTracker(goodTracker);

    expect(() => analytics.page({ name: 'Page', path: '/page' })).not.toThrow();
    expect(goodTracker.page).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});

describe('trackToolEntry', () => {
  test('fires tool_entry event with correct properties', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    trackToolEntry('my-tool', 'My Tool');

    expect(tracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'tool_entry',
        properties: { tool_id: 'my-tool', tool_name: 'My Tool' },
      })
    );

    unsubscribe();
  });
});

describe('trackToolCompletion', () => {
  test('fires tool_completion event with success=true', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    trackToolCompletion('my-tool', 'My Tool', true);

    expect(tracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'tool_completion',
        properties: { success: true, tool_id: 'my-tool', tool_name: 'My Tool' },
      })
    );

    unsubscribe();
  });

  test('fires tool_completion event with success=false', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    trackToolCompletion('my-tool', 'My Tool', false);

    expect(tracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'tool_completion',
        properties: {
          success: false,
          tool_id: 'my-tool',
          tool_name: 'My Tool',
        },
      })
    );

    unsubscribe();
  });
});

describe('trackToolAction', () => {
  test('fires tool_action event with correct properties', () => {
    const tracker = createMockTracker();
    const unsubscribe = analytics.addTracker(tracker);

    trackToolAction('my-tool', 'My Tool', 'compress');

    expect(tracker.track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'tool_action',
        properties: {
          action: 'compress',
          tool_id: 'my-tool',
          tool_name: 'My Tool',
        },
      })
    );

    unsubscribe();
  });
});
