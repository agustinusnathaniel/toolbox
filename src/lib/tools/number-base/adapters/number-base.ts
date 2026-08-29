export type NumberBase = 2 | 8 | 10 | 16;

export const VALID_BASES: ReadonlyArray<NumberBase> = [2, 8, 10, 16];

export interface NumberBaseResult {
  binary: string;
  decimal: string;
  error?: string;
  hex: string;
  isValid: boolean;
  octal: string;
}

const BINARY_PREFIX_RE = /^0[bB]/;
const OCTAL_PREFIX_RE = /^0[oO]/;
const HEX_PREFIX_RE = /^0[xX]/;
const BINARY_RE = /^[01]+$/;
const OCTAL_RE = /^[0-7]+$/;
const DECIMAL_RE = /^[0-9]+$/;
const HEX_RE = /^[0-9a-fA-F]+$/;

function getBaseName(base: NumberBase): string {
  if (base === 2) {
    return 'binary';
  }
  if (base === 8) {
    return 'octal';
  }
  if (base === 10) {
    return 'decimal';
  }
  return 'hexadecimal';
}

function stripPrefix(value: string, base: NumberBase): string {
  if (base === 2 && BINARY_PREFIX_RE.test(value)) {
    return value.slice(2);
  }
  if (base === 8 && OCTAL_PREFIX_RE.test(value)) {
    return value.slice(2);
  }
  if (base === 16 && HEX_PREFIX_RE.test(value)) {
    return value.slice(2);
  }
  return value;
}

function getPattern(base: NumberBase): RegExp {
  if (base === 2) {
    return BINARY_RE;
  }
  if (base === 8) {
    return OCTAL_RE;
  }
  if (base === 10) {
    return DECIMAL_RE;
  }
  return HEX_RE;
}

function getPrefixForBase(base: NumberBase): string {
  if (base === 2) {
    return '0b';
  }
  if (base === 8) {
    return '0o';
  }
  if (base === 16) {
    return '0x';
  }
  return '';
}

export function isValidForBase(value: string, base: NumberBase): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const withoutSign = trimmed.startsWith('-') ? trimmed.slice(1) : trimmed;
  if (!withoutSign) {
    return false;
  }
  const stripped = stripPrefix(withoutSign, base);
  if (!stripped) {
    return false;
  }
  return getPattern(base).test(stripped);
}

export function normalizeBase(value: string | undefined): NumberBase {
  if (value === '2' || value === '8' || value === '10' || value === '16') {
    return Number.parseInt(value, 10) as NumberBase;
  }
  return 10;
}

export function convertNumberBase(
  input: string,
  fromBase: NumberBase
): NumberBaseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      binary: '',
      decimal: '',
      error: 'Input is empty',
      hex: '',
      isValid: false,
      octal: '',
    };
  }
  const isNegative = trimmed.startsWith('-');
  const absolute = isNegative ? trimmed.slice(1) : trimmed;
  if (!absolute) {
    return {
      binary: '',
      decimal: '',
      error: `Invalid ${getBaseName(fromBase)} number`,
      hex: '',
      isValid: false,
      octal: '',
    };
  }
  const stripped = stripPrefix(absolute, fromBase);
  if (!getPattern(fromBase).test(stripped)) {
    return {
      binary: '',
      decimal: '',
      error: `Invalid ${getBaseName(fromBase)} number`,
      hex: '',
      isValid: false,
      octal: '',
    };
  }
  try {
    let n: bigint;
    if (fromBase === 10) {
      n = BigInt(absolute);
    } else {
      n = BigInt(getPrefixForBase(fromBase) + stripped);
    }
    if (isNegative) {
      n = -n;
    }
    return {
      binary: n.toString(2),
      decimal: n.toString(10),
      hex: n.toString(16).toUpperCase(),
      isValid: true,
      octal: n.toString(8),
    };
  } catch (error) {
    return {
      binary: '',
      decimal: '',
      error: (error as Error).message,
      hex: '',
      isValid: false,
      octal: '',
    };
  }
}
