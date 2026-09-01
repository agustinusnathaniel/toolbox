import { describe, expect, test } from 'vite-plus/test';

import { parseUserAgent } from './ua-check';

// parseUserAgent is a thin projection over ua-parser-js; the library's
// detection database is its own concern. These tests cover the adapter's
// projection contract and its handling of edge-case input.
describe('parseUserAgent', () => {
  const chromeUA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  test('projects browser, os, device, and cpu fields for a typical UA', () => {
    const result = parseUserAgent(chromeUA);

    expect(result.browser.name).toBe('Chrome');
    expect(result.browser.version).toContain('120');
    expect(result.os.name).toBe('macOS');
    expect(result.device.type).toBeUndefined();
    expect(result).toHaveProperty('cpu.architecture');
  });

  test('returns the raw UA string', () => {
    const result = parseUserAgent(chromeUA);

    expect(result.ua).toBe(chromeUA);
  });

  test('handles malformed UA string without throwing', () => {
    const result = parseUserAgent('this is not a user agent string at all!!!');

    expect(result.ua).toBe('this is not a user agent string at all!!!');
    expect(result.browser.name).toBeUndefined();
    expect(result.os.name).toBeUndefined();
  });
});
