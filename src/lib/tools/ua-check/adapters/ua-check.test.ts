import { describe, expect, test } from 'vitest';

import { parseUserAgent } from './ua-check';

describe('parseUserAgent', () => {
  const chromeUA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const firefoxUA =
    'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0';
  const safariUA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';

  test('parses Chrome on macOS', () => {
    const result = parseUserAgent(chromeUA);

    expect(result.browser.name).toBe('Chrome');
    expect(result.browser.version).toContain('120');
    expect(result.os.name).toBe('macOS');
    expect(result.device.type).toBeUndefined();
  });

  test('parses Firefox on Linux', () => {
    const result = parseUserAgent(firefoxUA);

    expect(result.browser.name).toBe('Firefox');
    expect(result.browser.version).toContain('121');
    expect(result.os.name).toContain('Linux');
  });

  test('parses Safari on iPhone', () => {
    const result = parseUserAgent(safariUA);

    expect(result.browser.name).toBe('Mobile Safari');
    expect(result.os.name).toContain('iOS');
    expect(result.device.type).toBe('mobile');
    expect(result.device.vendor).toBe('Apple');
  });

  test('returns CPU architecture field (may be undefined in some environments)', () => {
    const result = parseUserAgent(chromeUA);

    expect(result.cpu).toHaveProperty('architecture');
  });

  test('returns the raw UA string', () => {
    const result = parseUserAgent(chromeUA);

    expect(result.ua).toBe(chromeUA);
  });
});
