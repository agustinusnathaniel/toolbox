import type { Color, Hsl, Oklch, Rgb } from 'culori/fn';
import {
  converter,
  formatHex,
  modeHsl,
  modeOklch,
  modeRgb,
  parse,
  parseHex,
  useMode as registerMode,
  round,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeHsl);
registerMode(modeOklch);

const toRgb = converter('rgb');
const toHsl = converter('hsl');
const toOklch = converter('oklch');
const round2 = round(2);
const round4 = round(4);

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

function clampChannel(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function rgbFrom8Bit(r: number, g: number, b: number): Rgb {
  return { b: b / 255, g: g / 255, mode: 'rgb', r: r / 255 };
}

function toRgbColor(rgb: Rgb): RgbColor {
  return {
    b: Math.round(clampChannel(rgb.b ?? 0) * 255),
    g: Math.round(clampChannel(rgb.g ?? 0) * 255),
    r: Math.round(clampChannel(rgb.r ?? 0) * 255),
  };
}

function toHslColor(hsl: Hsl): HslColor {
  return {
    h: round2(hsl.h ?? 0),
    l: round2((hsl.l ?? 0) * 100),
    s: round2((hsl.s ?? 0) * 100),
  };
}

function toOklchColor(oklch: Oklch): OklchColor {
  return {
    c: round4(oklch.c ?? 0),
    h: round2(oklch.h ?? 0),
    l: round4(oklch.l ?? 0),
  };
}

function detectFormat(input: string, parsed: Color): ColorFormat {
  if (parseHex(input)) {
    return 'hex';
  }
  if (parsed.mode === 'hsl' || parsed.mode === 'oklch') {
    return parsed.mode;
  }
  return 'rgb';
}

function buildParsedColor(
  input: string,
  format: ColorFormat,
  rgb: Rgb
): ParsedColor {
  const rounded = toRgbColor(rgb);
  const displayRgb = rgbFrom8Bit(rounded.r, rounded.g, rounded.b);
  return {
    format,
    hex: formatHex(displayRgb),
    hsl: toHslColor(toHsl(displayRgb)),
    input,
    oklch: toOklchColor(toOklch(displayRgb)),
    rgb: rounded,
  };
}

export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = parse(trimmed);
  if (!parsed) {
    return null;
  }
  return buildParsedColor(
    trimmed,
    detectFormat(trimmed, parsed),
    toRgb(parsed)
  );
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
    return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
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
