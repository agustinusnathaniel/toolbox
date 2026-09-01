import { describe, expect, test } from 'vite-plus/test';

import {
  formatColorString,
  hexToRgb,
  hslToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
} from './color-converter';

describe('hexToRgb', () => {
  test('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ b: 0, g: 0, r: 255 });
    expect(hexToRgb('#00ff00')).toEqual({ b: 0, g: 255, r: 0 });
    expect(hexToRgb('#0000ff')).toEqual({ b: 255, g: 0, r: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ b: 255, g: 255, r: 255 });
    expect(hexToRgb('#000000')).toEqual({ b: 0, g: 0, r: 0 });
  });

  test('parses 3-digit hex', () => {
    expect(hexToRgb('#f00')).toEqual({ b: 0, g: 0, r: 255 });
    expect(hexToRgb('#0f0')).toEqual({ b: 0, g: 255, r: 0 });
    expect(hexToRgb('#00f')).toEqual({ b: 255, g: 0, r: 0 });
    expect(hexToRgb('#fff')).toEqual({ b: 255, g: 255, r: 255 });
    expect(hexToRgb('#000')).toEqual({ b: 0, g: 0, r: 0 });
  });

  test('handles hex without hash', () => {
    expect(hexToRgb('ff0000')).toEqual({ b: 0, g: 0, r: 255 });
  });

  test('handles uppercase hex', () => {
    expect(hexToRgb('#FF0000')).toEqual({ b: 0, g: 0, r: 255 });
  });

  test('returns null for invalid hex', () => {
    expect(hexToRgb('#xyz')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('rgbToHex', () => {
  test('converts RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  test('clamps values to 0-255', () => {
    expect(rgbToHex(300, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, -10, 0)).toBe('#000000');
  });

  test('rounds fractional values', () => {
    expect(rgbToHex(127.5, 0, 0)).toBe('#800000');
  });
});

describe('rgbToHsl', () => {
  test('converts red', () => {
    const hsl = rgbToHsl(255, 0, 0);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  test('converts green', () => {
    const hsl = rgbToHsl(0, 255, 0);
    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  test('converts blue', () => {
    const hsl = rgbToHsl(0, 0, 255);
    expect(hsl.h).toBe(240);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  test('converts white', () => {
    const hsl = rgbToHsl(255, 255, 255);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(100);
  });

  test('converts black', () => {
    const hsl = rgbToHsl(0, 0, 0);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(0);
  });

  test('converts gray', () => {
    const hsl = rgbToHsl(128, 128, 128);
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(50.2);
  });

  test('converts orange', () => {
    const hsl = rgbToHsl(255, 136, 0);
    expect(hsl.h).toBe(32);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  test('converts purple', () => {
    const hsl = rgbToHsl(128, 0, 128);
    expect(hsl.h).toBe(300);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(25.1);
  });
});

describe('hslToRgb', () => {
  test('converts red', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ b: 0, g: 0, r: 255 });
  });

  test('converts green', () => {
    expect(hslToRgb(120, 100, 50)).toEqual({ b: 0, g: 255, r: 0 });
  });

  test('converts blue', () => {
    expect(hslToRgb(240, 100, 50)).toEqual({ b: 255, g: 0, r: 0 });
  });

  test('converts white', () => {
    expect(hslToRgb(0, 0, 100)).toEqual({ b: 255, g: 255, r: 255 });
  });

  test('converts black', () => {
    expect(hslToRgb(0, 0, 0)).toEqual({ b: 0, g: 0, r: 0 });
  });

  test('converts gray', () => {
    const rgb = hslToRgb(0, 0, 50);
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });
});

describe('rgbToOklch', () => {
  test('converts black', () => {
    const oklch = rgbToOklch(0, 0, 0);
    expect(oklch.l).toBe(0);
    expect(oklch.c).toBe(0);
  });

  test('converts white', () => {
    const oklch = rgbToOklch(255, 255, 255);
    expect(oklch.l).toBeCloseTo(1, 4);
    expect(oklch.c).toBeLessThan(0.001);
  });

  test('converts red', () => {
    const oklch = rgbToOklch(255, 0, 0);
    expect(oklch.l).toBeGreaterThan(0.6);
    expect(oklch.l).toBeLessThan(0.65);
    expect(oklch.c).toBeGreaterThan(0.25);
    expect(oklch.h).toBeGreaterThan(20);
    expect(oklch.h).toBeLessThan(35);
  });

  test('converts green', () => {
    const oklch = rgbToOklch(0, 255, 0);
    expect(oklch.h).toBeGreaterThan(130);
    expect(oklch.h).toBeLessThan(150);
  });

  test('converts blue', () => {
    const oklch = rgbToOklch(0, 0, 255);
    expect(oklch.h).toBeGreaterThan(260);
    expect(oklch.h).toBeLessThan(280);
  });

  test('gray has zero chroma', () => {
    const oklch = rgbToOklch(128, 128, 128);
    expect(oklch.c).toBeLessThan(0.001);
  });
});

describe('parseColor', () => {
  describe('HEX input', () => {
    test('parses 6-digit hex', () => {
      const result = parseColor('#ff0000');
      expect(result).not.toBeNull();
      expect(result?.format).toBe('hex');
      expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
      expect(result?.hex).toBe('#ff0000');
    });

    test('parses 3-digit hex', () => {
      const result = parseColor('#f00');
      expect(result).not.toBeNull();
      expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    });

    test('parses hex without hash', () => {
      const result = parseColor('ff0000');
      expect(result).not.toBeNull();
      expect(result?.rgb).toEqual({ b: 0, g: 0, r: 255 });
    });
  });

  describe('RGB input', () => {
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

    test('returns null for out-of-range rgb', () => {
      expect(parseColor('rgb(300, 0, 0)')).toBeNull();
    });
  });

  describe('HSL input', () => {
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

  describe('OKLCH input', () => {
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
  });

  describe('invalid input', () => {
    test('returns null for empty string', () => {
      expect(parseColor('')).toBeNull();
    });

    test('returns null for whitespace', () => {
      expect(parseColor('   ')).toBeNull();
    });

    test('returns null for gibberish', () => {
      expect(parseColor('not a color')).toBeNull();
    });
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
