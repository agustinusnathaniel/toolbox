/**
 * Pure Unicode inspection logic for the unicode-inspector tool.
 *
 * Zero dependencies: code points come from string iteration (surrogate-pair
 * safe), general categories come from RegExp Unicode property escapes, known
 * invisible/format characters come from an embedded notable-characters table,
 * and normalization uses `String.prototype.normalize`. The route owns React
 * state and share links; everything here is a pure function of its input.
 */

export type CharCategory =
  | 'control'
  | 'format'
  | 'letter'
  | 'mark'
  | 'number'
  | 'other'
  | 'punctuation'
  | 'separator'
  | 'symbol';

export interface InspectedChar {
  category: CharCategory;
  /** The single code point as a string (may be a surrogate pair). */
  char: string;
  /** `U+` prefixed uppercase hex label, e.g. `U+0041`, `U+1F600`. */
  codePoint: string;
  codePointNumber: number;
  /** Zero-based code-point position in the input. */
  index: number;
  /** True for controls, formats, and table-listed blank characters. */
  invisible: boolean;
  /** Human-readable name for notable invisible characters, else null. */
  name: string | null;
  /** True for bidi controls usable in Trojan-Source-style spoofing. */
  suspicious: boolean;
  /** Space-separated uppercase hex UTF-8 bytes, e.g. `F0 9F 98 80`. */
  utf8: string;
  /** Space-separated uppercase hex UTF-16 units, e.g. `D83D DE00`. */
  utf16: string;
}

export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

export interface InspectionSummary {
  invisibleCount: number;
  suspiciousCount: number;
  totalCodePoints: number;
  utf8ByteLength: number;
}

const CONTROL_REGEX = /\p{Cc}/u;
const FORMAT_REGEX = /\p{Cf}/u;
const LETTER_REGEX = /\p{L}/u;
const MARK_REGEX = /\p{M}/u;
const NUMBER_REGEX = /\p{N}/u;
const PUNCTUATION_REGEX = /\p{P}/u;
const SEPARATOR_REGEX = /\p{Z}/u;
const SYMBOL_REGEX = /\p{S}/u;

export const NORMALIZATION_FORMS: ReadonlyArray<NormalizationForm> = [
  'NFC',
  'NFD',
  'NFKC',
  'NFKD',
];

/**
 * Bidirectional controls that can visually reorder text (CVE-2021-42574
 * "Trojan Source" class). Zero-width joiners and spaces are invisible but
 * legitimate typography, so they are not suspicious.
 */
const SUSPICIOUS_CODE_POINTS: ReadonlySet<number> = new Set([
  0x06_1c, 0x20_2a, 0x20_2b, 0x20_2c, 0x20_2d, 0x20_2e, 0x20_66, 0x20_67,
  0x20_68, 0x20_69,
]);

/** Notable invisible, blank, or format characters keyed by code point. */
const KNOWN_INVISIBLE_NAMES: Readonly<Record<number, string>> = {
  160: 'No-Break Space',
  173: 'Soft Hyphen',
  847: 'Combining Grapheme Joiner',
  1564: 'Arabic Letter Mark',
  4447: 'Hangul Choseong Filler',
  4448: 'Hangul Jungseong Filler',
  6158: 'Mongolian Vowel Separator',
  8192: 'En Quad',
  8193: 'Em Quad',
  8194: 'En Space',
  8195: 'Em Space',
  8196: 'Three-Per-Em Space',
  8197: 'Four-Per-Em Space',
  8198: 'Six-Per-Em Space',
  8199: 'Figure Space',
  8200: 'Punctuation Space',
  8201: 'Thin Space',
  8202: 'Hair Space',
  8203: 'Zero Width Space',
  8204: 'Zero Width Non-Joiner',
  8205: 'Zero Width Joiner',
  8206: 'Left-to-Right Mark',
  8207: 'Right-to-Left Mark',
  8232: 'Line Separator',
  8233: 'Paragraph Separator',
  8234: 'Left-to-Right Embedding',
  8235: 'Right-to-Left Embedding',
  8236: 'Pop Directional Formatting',
  8237: 'Left-to-Right Override',
  8238: 'Right-to-Left Override',
  8239: 'Narrow No-Break Space',
  8287: 'Medium Mathematical Space',
  8288: 'Word Joiner',
  8289: 'Function Application',
  8290: 'Invisible Times',
  8291: 'Invisible Separator',
  8292: 'Invisible Plus',
  8294: 'Left-to-Right Isolate',
  8295: 'Right-to-Left Isolate',
  8296: 'First Strong Isolate',
  8297: 'Pop Directional Isolate',
  10240: 'Braille Pattern Blank',
  12288: 'Ideographic Space',
  12644: 'Hangul Filler',
  65279: 'Zero Width No-Break Space (BOM)',
  65440: 'Halfwidth Hangul Filler',
  65529: 'Interlinear Annotation Anchor',
  65530: 'Interlinear Annotation Separator',
  65531: 'Interlinear Annotation Terminator',
};

export function formatCodePoint(codePoint: number): string {
  const digits = codePoint <= 0xff_ff ? 4 : 5;
  return `U+${codePoint.toString(16).toUpperCase().padStart(digits, '0')}`;
}

function formatUtf8(char: string): string {
  const bytes = new TextEncoder().encode(char);
  return [...bytes]
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');
}

function formatUtf16(char: string): string {
  const units: Array<string> = [];
  for (let i = 0; i < char.length; i += 1) {
    units.push(char.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0'));
  }
  return units.join(' ');
}

export function categorizeChar(char: string): CharCategory {
  if (CONTROL_REGEX.test(char)) {
    return 'control';
  }
  if (FORMAT_REGEX.test(char)) {
    return 'format';
  }
  if (LETTER_REGEX.test(char)) {
    return 'letter';
  }
  if (MARK_REGEX.test(char)) {
    return 'mark';
  }
  if (NUMBER_REGEX.test(char)) {
    return 'number';
  }
  if (PUNCTUATION_REGEX.test(char)) {
    return 'punctuation';
  }
  if (SEPARATOR_REGEX.test(char)) {
    return 'separator';
  }
  if (SYMBOL_REGEX.test(char)) {
    return 'symbol';
  }
  return 'other';
}

function isInvisible(codePoint: number, category: CharCategory): boolean {
  return (
    KNOWN_INVISIBLE_NAMES[codePoint] !== undefined ||
    category === 'control' ||
    category === 'format'
  );
}

/** Inspect every code point of the input, in order. */
export function inspectCharacters(input: string): Array<InspectedChar> {
  const result: Array<InspectedChar> = [];
  let index = 0;
  for (const char of input) {
    const codePointNumber = char.codePointAt(0) ?? 0;
    const category = categorizeChar(char);
    result.push({
      category,
      char,
      codePoint: formatCodePoint(codePointNumber),
      codePointNumber,
      index,
      invisible: isInvisible(codePointNumber, category),
      name: KNOWN_INVISIBLE_NAMES[codePointNumber] ?? null,
      suspicious: SUSPICIOUS_CODE_POINTS.has(codePointNumber),
      utf8: formatUtf8(char),
      utf16: formatUtf16(char),
    });
    index += 1;
  }
  return result;
}

/** All four normalization forms of the input via the native normalizer. */
export function normalizeAllForms(
  input: string
): Record<NormalizationForm, string> {
  return {
    NFC: input.normalize('NFC'),
    NFD: input.normalize('NFD'),
    NFKC: input.normalize('NFKC'),
    NFKD: input.normalize('NFKD'),
  };
}

/** Forms whose normalized value differs from the raw input. */
export function changedForms(
  input: string,
  forms: Record<NormalizationForm, string>
): Array<NormalizationForm> {
  return NORMALIZATION_FORMS.filter((form) => forms[form] !== input);
}

export function utf8ByteLength(input: string): number {
  return new TextEncoder().encode(input).length;
}

/** Table flag for a character: worst signal wins. */
export function flagLabel(char: InspectedChar): string {
  if (char.suspicious) {
    return 'suspicious';
  }
  if (char.invisible) {
    return char.name ?? 'invisible';
  }
  return '—';
}

export function summarizeInspection(
  input: string,
  chars: ReadonlyArray<InspectedChar>
): InspectionSummary {
  return {
    invisibleCount: chars.filter((c) => c.invisible).length,
    suspiciousCount: chars.filter((c) => c.suspicious).length,
    totalCodePoints: chars.length,
    utf8ByteLength: utf8ByteLength(input),
  };
}
