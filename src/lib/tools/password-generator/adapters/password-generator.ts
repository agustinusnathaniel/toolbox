export interface PasswordOptions {
  digits: boolean;
  excludeAmbiguous: boolean;
  length: number;
  lowercase: boolean;
  symbols: boolean;
  uppercase: boolean;
}

export interface PasswordResult {
  error?: string;
  isValid: boolean;
  output: string;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';
const AMBIGUOUS = 'Il1O0o';

function removeAmbiguous(set: string): string {
  return [...set].filter((char) => !AMBIGUOUS.includes(char)).join('');
}

function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function selectedSets(options: PasswordOptions): Array<string> {
  const sets = [
    options.lowercase ? LOWERCASE : '',
    options.uppercase ? UPPERCASE : '',
    options.digits ? DIGITS : '',
    options.symbols ? SYMBOLS : '',
  ].filter(Boolean);
  if (!options.excludeAmbiguous) {
    return sets;
  }
  return sets.map(removeAmbiguous).filter(Boolean);
}

export function generatePassword(options: PasswordOptions): PasswordResult {
  if (
    !Number.isInteger(options.length) ||
    options.length < 8 ||
    options.length > 128
  ) {
    return {
      error: 'Length must be between 8 and 128 characters',
      isValid: false,
      output: '',
    };
  }

  const sets = selectedSets(options);
  if (sets.length === 0) {
    return {
      error: 'Select at least one character set',
      isValid: false,
      output: '',
    };
  }

  const pool = sets.join('');
  const chars: Array<string> = [];

  // Guarantee at least one character from each selected set
  for (const set of sets) {
    const setChars = [...set];
    chars.push(setChars[randomInt(setChars.length)]);
  }

  // Fill the rest from the combined pool
  const poolChars = [...pool];
  while (chars.length < options.length) {
    chars.push(poolChars[randomInt(poolChars.length)]);
  }

  // Fisher-Yates shuffle so guaranteed chars are not always at the front
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return { isValid: true, output: chars.join('') };
}

export function estimateEntropy(options: PasswordOptions): number {
  const sets = selectedSets(options);
  if (sets.length === 0) {
    return 0;
  }
  const poolSize = sets.join('').length;
  return Math.round(options.length * Math.log2(poolSize) * 10) / 10;
}

export function strengthLabel(entropy: number): string {
  if (entropy >= 100) {
    return 'Very strong';
  }
  if (entropy >= 70) {
    return 'Strong';
  }
  if (entropy >= 50) {
    return 'Good';
  }
  return 'Weak';
}
