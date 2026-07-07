import { describe, expect, test } from 'vite-plus/test';

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

  const operaUA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0';

  test('parses Opera on macOS', () => {
    const result = parseUserAgent(operaUA);

    expect(result.browser.name).toBe('Opera');
    expect(result.os.name).toBe('macOS');
  });

  const samsungUA =
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/120.0.6099.230 Mobile Safari/537.36';

  test('parses Samsung Internet on Android', () => {
    const result = parseUserAgent(samsungUA);

    expect(result.browser.name).toBe('Samsung Internet');
    expect(result.os.name).toBe('Android');
    expect(result.device.type).toBe('mobile');
    expect(result.device.vendor).toBe('Samsung');
  });

  const bingbotUA =
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/120.0.0.0 Safari/537.36';

  test('parses Bingbot crawler', () => {
    const result = parseUserAgent(bingbotUA);

    expect(result.browser.name).toBe('Chrome');
    expect(result.os.name).toBeUndefined();
    expect(result.device.type).toBeUndefined();
  });

  test('handles malformed UA string without throwing', () => {
    const result = parseUserAgent('this is not a user agent string at all!!!');

    expect(result.ua).toBe('this is not a user agent string at all!!!');
    expect(result.browser.name).toBeUndefined();
    expect(result.os.name).toBeUndefined();
  });
});
