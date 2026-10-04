export type NumberBase = 2 | 8 | 10 | 16;

export interface NumberBaseResult {
  binary: string;
  decimal: string;
  error?: string;
  hex: string;
  isValid: boolean;
  octal: string;
}

const BASE_RULES: Record<
  NumberBase,
  { name: string; pattern: RegExp; prefix: string }
> = {
  2: { name: 'binary', pattern: /^[01]+$/, prefix: '0b' },
  8: { name: 'octal', pattern: /^[0-7]+$/, prefix: '0o' },
  10: { name: 'decimal', pattern: /^[0-9]+$/, prefix: '' },
  16: { name: 'hexadecimal', pattern: /^[0-9a-fA-F]+$/, prefix: '0x' },
};

function stripPrefix(value: string, base: NumberBase): string {
  const { prefix } = BASE_RULES[base];
  return prefix && value.startsWith(prefix)
    ? value.slice(prefix.length)
    : value;
}

export function isValidForBase(value: string, base: NumberBase): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const withoutSign = trimmed.startsWith('-') ? trimmed.slice(1) : trimmed;
  const stripped = stripPrefix(withoutSign, base);
  return (
    Boolean(stripped) &&
    stripped.length <= 500 &&
    BASE_RULES[base].pattern.test(stripped)
  );
}

export function normalizeBase(value: string | undefined): NumberBase {
  if (value === '2' || value === '8' || value === '10' || value === '16') {
    return Number.parseInt(value, 10) as NumberBase;
  }
  return 10;
}

function invalidResult(error: string): NumberBaseResult {
  return {
    binary: '',
    decimal: '',
    error,
    hex: '',
    isValid: false,
    octal: '',
  };
}

export function convertNumberBase(
  input: string,
  fromBase: NumberBase
): NumberBaseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return invalidResult('Input is empty');
  }
  const isNegative = trimmed.startsWith('-');
  const absolute = isNegative ? trimmed.slice(1) : trimmed;
  const stripped = stripPrefix(absolute, fromBase);
  if (!absolute) {
    return invalidResult(`Invalid ${BASE_RULES[fromBase].name} number`);
  }
  if (stripped.length > 500) {
    return invalidResult('Input too long (max 500 digits)');
  }
  if (!BASE_RULES[fromBase].pattern.test(stripped)) {
    return invalidResult(`Invalid ${BASE_RULES[fromBase].name} number`);
  }
  try {
    const { prefix } = BASE_RULES[fromBase];
    let n = fromBase === 10 ? BigInt(absolute) : BigInt(prefix + stripped);
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
    return invalidResult(
      error instanceof Error ? error.message : 'Invalid number'
    );
  }
}
