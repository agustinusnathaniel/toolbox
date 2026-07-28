export interface RgbColor {
  b: number;
  g: number;
  r: number;
}

export interface HslColor {
  h: number;
  l: number;
  s: number;
}

export interface OklchColor {
  c: number;
  h: number;
  l: number;
}

export type ColorFormat = 'hex' | 'hsl' | 'oklch' | 'rgb';

export interface ParsedColor {
  format: ColorFormat;
  hex: string;
  hsl: HslColor;
  input: string;
  oklch: OklchColor;
  rgb: RgbColor;
}

const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_REGEX =
  /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+%?\s*)?\)$/;
const HSL_REGEX =
  /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+%?\s*)?\)$/;
const OKLCH_REGEX = /^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*\)$/;

function parseHex(hex: string): RgbColor | null {
  const cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    const r = Number.parseInt(cleaned[0] + cleaned[0], 16);
    const g = Number.parseInt(cleaned[1] + cleaned[1], 16);
    const b = Number.parseInt(cleaned[2] + cleaned[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return null;
    }
    return { b, g, r };
  }
  if (cleaned.length === 6) {
    const r = Number.parseInt(cleaned.slice(0, 2), 16);
    const g = Number.parseInt(cleaned.slice(2, 4), 16);
    const b = Number.parseInt(cleaned.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return null;
    }
    return { b, g, r };
  }
  return null;
}

export function hexToRgb(hex: string): RgbColor | null {
  return parseHex(hex);
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) {
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    } else if (max === gn) {
      h = ((bn - rn) / d + 2) * 60;
    } else {
      h = ((rn - gn) / d + 4) * 60;
    }
  }

  return {
    h: Math.round(h * 100) / 100,
    l: Math.round(l * 100 * 100) / 100,
    s: Math.round(s * 100 * 100) / 100,
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) {
    tt += 1;
  }
  if (tt > 1) {
    tt -= 1;
  }
  if (tt < 1 / 6) {
    return p + (q - p) * 6 * tt;
  }
  if (tt < 1 / 2) {
    return q;
  }
  if (tt < 2 / 3) {
    return p + (q - p) * (2 / 3 - tt) * 6;
  }
  return p;
}

export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { b: v, g: v, r: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;

  return {
    b: Math.round(hueToRgb(p, q, hn - 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hn) * 255),
    r: Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
  };
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.040_45 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  const v = c <= 0.003_130_8 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
}

export function rgbToOklch(r: number, g: number, b: number): OklchColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = 0.412_221_470_8 * lr + 0.536_882_536_8 * lg + 0.051_445_992_9 * lb;
  const m_ = 0.211_903_498_2 * lr + 0.680_699_545_1 * lg + 0.107_396_956_6 * lb;
  const s_ = 0.088_302_461_9 * lr + 0.281_718_837_6 * lg + 0.629_978_700_5 * lb;

  const l3 = Math.cbrt(l_);
  const m3 = Math.cbrt(m_);
  const s3 = Math.cbrt(s_);

  const L = 0.210_454_255_3 * l3 + 0.793_617_785 * m3 - 0.004_072_046_8 * s3;
  const a = 1.977_998_495_1 * l3 - 2.428_592_205 * m3 + 0.450_593_709_9 * s3;
  const b_ = 0.025_904_037_1 * l3 + 0.782_771_766_2 * m3 - 0.808_675_766 * s3;

  const C = Math.sqrt(a * a + b_ * b_);
  const H = (Math.atan2(b_, a) * 180) / Math.PI;

  return {
    c: Math.round(C * 10_000) / 10_000,
    h: Math.round((H < 0 ? H + 360 : H) * 100) / 100,
    l: Math.round(L * 10_000) / 10_000,
  };
}

function oklchToRgb(l: number, c: number, h: number): RgbColor {
  const L = l;
  const a = c * Math.cos((h * Math.PI) / 180);
  const b_ = c * Math.sin((h * Math.PI) / 180);

  const l3 = L + 0.396_337_777_4 * a + 0.215_803_757_3 * b_;
  const m3 = L - 0.105_561_345_8 * a - 0.063_854_172_8 * b_;
  const s3 = L - 0.089_484_177_5 * a - 1.291_485_548 * b_;

  const l_ = l3 * l3 * l3;
  const m_ = m3 * m3 * m3;
  const s_ = s3 * s3 * s3;

  const r = linearToSrgb(
    4.076_741_662_1 * l_ - 3.307_711_591_3 * m_ + 0.230_969_929_2 * s_
  );
  const g = linearToSrgb(
    -1.268_438_004_6 * l_ + 2.609_757_401_1 * m_ - 0.341_319_396_5 * s_
  );
  const b = linearToSrgb(
    -0.004_196_086_3 * l_ - 0.703_418_614_7 * m_ + 1.707_614_701 * s_
  );

  return { b, g, r };
}

function hslStringToRgb(hsl: string): RgbColor | null {
  const match = hsl.match(HSL_REGEX);
  if (!match) {
    return null;
  }
  const h = Number.parseInt(match[1], 10);
  const s = Number.parseInt(match[2], 10);
  const l = Number.parseInt(match[3], 10);
  return hslToRgb(h, s, l);
}

function oklchStringToRgb(oklch: string): RgbColor | null {
  const match = oklch.match(OKLCH_REGEX);
  if (!match) {
    return null;
  }
  let l = Number.parseFloat(match[1]);
  const c = Number.parseFloat(match[2]);
  const h = Number.parseFloat(match[3]);
  if (l > 1) {
    l /= 100;
  }
  return oklchToRgb(l, c, h);
}

export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (HEX_REGEX.test(trimmed)) {
    const rgb = parseHex(trimmed);
    if (!rgb) {
      return null;
    }
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return {
      format: 'hex',
      hex,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      input: trimmed,
      oklch: rgbToOklch(rgb.r, rgb.g, rgb.b),
      rgb,
    };
  }

  if (RGB_REGEX.test(trimmed)) {
    const match = trimmed.match(RGB_REGEX);
    if (!match) {
      return null;
    }
    const r = Number.parseInt(match[1], 10);
    const g = Number.parseInt(match[2], 10);
    const b = Number.parseInt(match[3], 10);
    if (r > 255 || g > 255 || b > 255) {
      return null;
    }
    const rgb: RgbColor = { b, g, r };
    return {
      format: 'rgb',
      hex: rgbToHex(r, g, b),
      hsl: rgbToHsl(r, g, b),
      input: trimmed,
      oklch: rgbToOklch(r, g, b),
      rgb,
    };
  }

  if (HSL_REGEX.test(trimmed)) {
    const rgb = hslStringToRgb(trimmed);
    if (!rgb) {
      return null;
    }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return {
      format: 'hsl',
      hex,
      hsl,
      input: trimmed,
      oklch: rgbToOklch(rgb.r, rgb.g, rgb.b),
      rgb,
    };
  }

  if (OKLCH_REGEX.test(trimmed)) {
    const rgb = oklchStringToRgb(trimmed);
    if (!rgb) {
      return null;
    }
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return {
      format: 'oklch',
      hex,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      input: trimmed,
      oklch: rgbToOklch(rgb.r, rgb.g, rgb.b),
      rgb,
    };
  }

  return null;
}

export function formatColorString(
  color: ParsedColor,
  format: ColorFormat
): string {
  if (format === 'hex') {
    return color.hex;
  }
  if (format === 'rgb') {
    return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  }
  if (format === 'hsl') {
    return `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s)}%, ${Math.round(color.hsl.l)}%)`;
  }
  return `oklch(${(color.oklch.l * 100).toFixed(1)}% ${color.oklch.c.toFixed(4)} ${color.oklch.h.toFixed(1)})`;
}

export const PRESET_COLORS: Array<{ hex: string; label: string }> = [
  { hex: '#ff0000', label: 'Red' },
  { hex: '#00ff00', label: 'Green' },
  { hex: '#0000ff', label: 'Blue' },
  { hex: '#ffff00', label: 'Yellow' },
  { hex: '#ff00ff', label: 'Magenta' },
  { hex: '#00ffff', label: 'Cyan' },
  { hex: '#000000', label: 'Black' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#808080', label: 'Gray' },
  { hex: '#ff8800', label: 'Orange' },
  { hex: '#800080', label: 'Purple' },
  { hex: '#ffc0cb', label: 'Pink' },
];
