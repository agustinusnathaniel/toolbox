export interface ChmodTriad {
  execute: boolean;
  read: boolean;
  write: boolean;
}

export interface ChmodBits {
  group: ChmodTriad;
  other: ChmodTriad;
  owner: ChmodTriad;
  setgid: boolean;
  setuid: boolean;
  sticky: boolean;
}

const OCTAL_PATTERN = /^[0-7]{3,4}$/;
const SYMBOLIC_PATTERN = /^[rwxstST-]{9}$/;

export const DEFAULT_CHMOD_OCTAL = '644';

export interface ChmodExample {
  label: string;
  octal: string;
}

export const CHMOD_EXAMPLES: Array<ChmodExample> = [
  { label: 'Executable script', octal: '755' },
  { label: 'Config file', octal: '644' },
  { label: 'Private file', octal: '600' },
  { label: 'Setuid binary', octal: '4755' },
  { label: 'Shared directory', octal: '1777' },
];

export function triadToDigit(triad: ChmodTriad): number {
  return (triad.read ? 4 : 0) + (triad.write ? 2 : 0) + (triad.execute ? 1 : 0);
}

function digitToTriad(digit: number): ChmodTriad {
  return {
    execute: digit % 2 === 1,
    read: digit >= 4,
    write: digit % 4 >= 2,
  };
}

export function modeToOctal(bits: ChmodBits): string {
  const base = `${triadToDigit(bits.owner)}${triadToDigit(bits.group)}${triadToDigit(bits.other)}`;
  const special =
    (bits.setuid ? 4 : 0) + (bits.setgid ? 2 : 0) + (bits.sticky ? 1 : 0);
  return special > 0 ? `${special}${base}` : base;
}

export function octalToBits(octal: string): ChmodBits | null {
  const cleaned = octal.trim();
  if (!OCTAL_PATTERN.test(cleaned)) {
    return null;
  }
  const digits = cleaned.split('').map(Number);
  const special = digits.length === 4 ? digits[0] : 0;
  const [owner, group, other] = digits.slice(-3);
  return {
    group: digitToTriad(group),
    other: digitToTriad(other),
    owner: digitToTriad(owner),
    setgid: special % 4 >= 2,
    setuid: special >= 4,
    sticky: special % 2 === 1,
  };
}

function executeSlot(
  execute: boolean,
  special: boolean,
  lower: string,
  upper: string
): string {
  if (special) {
    return execute ? lower : upper;
  }
  return execute ? 'x' : '-';
}

export function bitsToSymbolic(bits: ChmodBits): string {
  const render = (triad: ChmodTriad): string =>
    `${triad.read ? 'r' : '-'}${triad.write ? 'w' : '-'}`;
  return (
    `${render(bits.owner)}${executeSlot(bits.owner.execute, bits.setuid, 's', 'S')}` +
    `${render(bits.group)}${executeSlot(bits.group.execute, bits.setgid, 's', 'S')}` +
    `${render(bits.other)}${executeSlot(bits.other.execute, bits.sticky, 't', 'T')}`
  );
}

interface SymbolicTriad {
  special: boolean;
  triad: ChmodTriad;
}

function parseSymbolicTriad(
  chars: Array<string>,
  specialLower: string,
  specialUpper: string
): SymbolicTriad | null {
  const [r, w, x] = chars;
  if (r !== 'r' && r !== '-') {
    return null;
  }
  if (w !== 'w' && w !== '-') {
    return null;
  }
  if (x === 'x') {
    return {
      special: false,
      triad: { execute: true, read: r === 'r', write: w === 'w' },
    };
  }
  if (x === '-') {
    return {
      special: false,
      triad: { execute: false, read: r === 'r', write: w === 'w' },
    };
  }
  if (x === specialLower) {
    return {
      special: true,
      triad: { execute: true, read: r === 'r', write: w === 'w' },
    };
  }
  if (x === specialUpper) {
    return {
      special: true,
      triad: { execute: false, read: r === 'r', write: w === 'w' },
    };
  }
  return null;
}

export function symbolicToBits(symbolic: string): ChmodBits | null {
  const cleaned = symbolic.trim();
  if (!SYMBOLIC_PATTERN.test(cleaned)) {
    return null;
  }
  const chars = cleaned.split('');
  const owner = parseSymbolicTriad(chars.slice(0, 3), 's', 'S');
  const group = parseSymbolicTriad(chars.slice(3, 6), 's', 'S');
  const other = parseSymbolicTriad(chars.slice(6, 9), 't', 'T');
  if (owner === null || group === null || other === null) {
    return null;
  }
  return {
    group: group.triad,
    other: other.triad,
    owner: owner.triad,
    setgid: group.special,
    setuid: owner.special,
    sticky: other.special,
  };
}
