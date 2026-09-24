import { describe, expect, test } from 'vite-plus/test';

import { formatColorString, parseColor } from './color-converter';

describe('parseColor HEX input', () => {
  test.each([
    ['#ff0000', { b: 0, g: 0, r: 255 }],
    ['#f00', { b: 0, g: 0, r: 255 }],
    ['ff0000', { b: 0, g: 0, r: 255 }],
    ['#FF0000', { b: 0, g: 0, r: 255 }],
    ['#f00f', { b: 0, g: 0, r: 255 }],
    ['#ff000080', { b: 0, g: 0, r: 255 }],
  ])('parses hex variant %s', (input, rgb) => {
    const result = parseColor(input);
    expect(result).not.toBeNull();
    expect(result?.format).toBe('hex');
    expect(result?.rgb).toEqual(rgb);
  });
});

describe('parseColor RGB input', () => {
  test('parses rgb()', () => {
    const result = parseColor('rgb(255, 0, 0)');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('rgb');
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    expect(result?.hex).toBe('#ff0000');
  });

  test('parses rgba()', () => {
    const result = parseColor('rgba(255, 0, 0, 0.5)');
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
  });

  test('parses rgb with spaces', () => {
    const result = parseColor('rgb(0, 255, 0)');
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual({ b: 0, g: 255, r: 0 });
  });

  test.each([
    ['rgb(300, 0, 0)', { b: 0, g: 0, r: 255 }, '#ff0000'],
    ['rgb(127.5, 0, 0)', { b: 0, g: 0, r: 128 }, '#800000'],
  ])('clamps and rounds channels for %s', (input, rgb, hex) => {
    const result = parseColor(input);
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual(rgb);
    expect(result?.hex).toBe(hex);
  });
});

describe('parseColor HSL input', () => {
  test('parses hsl()', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('hsl');
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    expect(result?.hex).toBe('#ff0000');
  });

  test('parses hsla()', () => {
    const result = parseColor('hsla(120, 100%, 50%, 0.5)');
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual({ b: 0, g: 255, r: 0 });
  });

  test('parses hsl with spaces', () => {
    const result = parseColor('hsl(240, 100%, 50%)');
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual({ b: 255, g: 0, r: 0 });
  });
});

describe('parseColor OKLCH input', () => {
  test('parses oklch()', () => {
    const result = parseColor('oklch(0.6278 0.2577 29.23)');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('oklch');
    expect(result?.rgb.r).toBeGreaterThan(240);
    expect(result?.rgb.g).toBeLessThan(10);
    expect(result?.rgb.b).toBeLessThan(10);
  });

  test('parses oklch with percentage lightness', () => {
    const result = parseColor('oklch(62.78% 0.2577 29.23)');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('oklch');
  });

  test('derives all outputs from the rounded rgb color', () => {
    const red = parseColor('#ff0000');
    const result = parseColor('oklch(62.78% 0.2577 29.23)');
    expect(result?.hex).toBe('#ff0000');
    expect(result?.hsl).toEqual(red?.hsl);
    expect(result?.oklch).toEqual(red?.oklch);
  });
});

describe('parseColor expanded input syntax', () => {
  test('parses named CSS colors', () => {
    const result = parseColor('red');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('rgb');
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    expect(result?.hex).toBe('#ff0000');
  });

  test('parses space-separated rgb()', () => {
    const result = parseColor('rgb(255 0 0)');
    expect(result).not.toBeNull();
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    expect(result?.hex).toBe('#ff0000');
  });

  test('parses space-separated hsl()', () => {
    const result = parseColor('hsl(0 100% 50%)');
    expect(result).not.toBeNull();
    expect(result?.format).toBe('hsl');
    expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
  });
});

describe('parseColor invalid input', () => {
  test('returns null for whitespace', () => {
    expect(parseColor('   ')).toBeNull();
  });

  test('returns null for gibberish', () => {
    expect(parseColor('not a color')).toBeNull();
  });
});

describe('formatColorString', () => {
  const parsed = parseColor('#ff0000') as NonNullable<
    ReturnType<typeof parseColor>
  >;

  test('formats hex', () => {
    expect(formatColorString(parsed, 'hex')).toBe('#ff0000');
  });

  test('formats rgb', () => {
    expect(formatColorString(parsed, 'rgb')).toBe('rgb(255, 0, 0)');
  });

  test('formats hsl', () => {
    expect(formatColorString(parsed, 'hsl')).toBe('hsl(0, 100%, 50%)');
  });

  test('formats oklch', () => {
    expect(formatColorString(parsed, 'oklch')).toBe('oklch(62.8% 0.2577 29.2)');
  });
});
