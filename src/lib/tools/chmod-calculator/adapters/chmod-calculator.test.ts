import { describe, expect, test } from 'vite-plus/test';

import {
  bitsToSymbolic,
  CHMOD_EXAMPLES,
  type ChmodBits,
  DEFAULT_CHMOD_OCTAL,
  modeToOctal,
  octalToBits,
  symbolicToBits,
  triadToDigit,
} from './chmod-calculator';

function makeBits(overrides: Partial<ChmodBits> = {}): ChmodBits {
  return {
    group: { execute: true, read: true, write: false },
    other: { execute: true, read: true, write: false },
    owner: { execute: true, read: true, write: true },
    setgid: false,
    setuid: false,
    sticky: false,
    ...overrides,
  };
}

describe('triadToDigit', () => {
  test('weights read/write/execute as 4/2/1', () => {
    expect(triadToDigit({ execute: false, read: true, write: false })).toBe(4);
    expect(triadToDigit({ execute: false, read: false, write: true })).toBe(2);
    expect(triadToDigit({ execute: true, read: false, write: false })).toBe(1);
  });

  test('sums combined permissions', () => {
    expect(triadToDigit({ execute: true, read: true, write: true })).toBe(7);
    expect(triadToDigit({ execute: true, read: true, write: false })).toBe(5);
    expect(triadToDigit({ execute: false, read: false, write: false })).toBe(0);
  });
});

describe('modeToOctal', () => {
  test('renders common modes without a special-bits prefix', () => {
    expect(modeToOctal(octalToBits('755') ?? makeBits())).toBe('755');
    expect(modeToOctal(octalToBits('644') ?? makeBits())).toBe('644');
    expect(modeToOctal(octalToBits('600') ?? makeBits())).toBe('600');
    expect(modeToOctal(octalToBits('777') ?? makeBits())).toBe('777');
    expect(modeToOctal(octalToBits('000') ?? makeBits())).toBe('000');
  });

  test('prefixes the special-bits digit when setuid/setgid/sticky are set', () => {
    expect(modeToOctal(octalToBits('4755') ?? makeBits())).toBe('4755');
    expect(modeToOctal(octalToBits('2755') ?? makeBits())).toBe('2755');
    expect(modeToOctal(octalToBits('1777') ?? makeBits())).toBe('1777');
    expect(modeToOctal(octalToBits('7777') ?? makeBits())).toBe('7777');
  });
});

describe('octalToBits', () => {
  test('parses three-digit modes with no special bits', () => {
    const bits = octalToBits('755');
    expect(bits?.owner).toEqual({ execute: true, read: true, write: true });
    expect(bits?.group).toEqual({
      execute: true,
      read: true,
      write: false,
    });
    expect(bits?.other).toEqual({
      execute: true,
      read: true,
      write: false,
    });
    expect(bits?.setuid).toBe(false);
    expect(bits?.setgid).toBe(false);
    expect(bits?.sticky).toBe(false);
  });

  test('parses the leading special-bits digit', () => {
    expect(octalToBits('4755')?.setuid).toBe(true);
    expect(octalToBits('2755')?.setgid).toBe(true);
    expect(octalToBits('1755')?.sticky).toBe(true);
    expect(octalToBits('7777')).toMatchObject({
      setgid: true,
      setuid: true,
      sticky: true,
    });
  });

  test('trims surrounding whitespace', () => {
    expect(octalToBits('  644\n')?.owner).toEqual({
      execute: false,
      read: true,
      write: true,
    });
  });

  test('rejects out-of-range digits and wrong lengths', () => {
    expect(octalToBits('888')).toBeNull();
    expect(octalToBits('75')).toBeNull();
    expect(octalToBits('8755')).toBeNull();
    expect(octalToBits('')).toBeNull();
    expect(octalToBits('abc')).toBeNull();
    expect(octalToBits('64a')).toBeNull();
  });
});

describe('bitsToSymbolic', () => {
  test('renders plain modes', () => {
    expect(bitsToSymbolic(octalToBits('755') ?? makeBits())).toBe('rwxr-xr-x');
    expect(bitsToSymbolic(octalToBits('644') ?? makeBits())).toBe('rw-r--r--');
    expect(bitsToSymbolic(octalToBits('600') ?? makeBits())).toBe('rw-------');
  });

  test('renders lowercase s/t when execute is also set', () => {
    expect(bitsToSymbolic(octalToBits('4755') ?? makeBits())).toBe('rwsr-xr-x');
    expect(bitsToSymbolic(octalToBits('2755') ?? makeBits())).toBe('rwxr-sr-x');
    expect(bitsToSymbolic(octalToBits('1755') ?? makeBits())).toBe('rwxr-xr-t');
  });

  test('renders uppercase S/T when execute is not set', () => {
    expect(bitsToSymbolic(octalToBits('4444') ?? makeBits())).toBe('r-Sr--r--');
    expect(bitsToSymbolic(octalToBits('2644') ?? makeBits())).toBe('rw-r-Sr--');
    expect(bitsToSymbolic(octalToBits('1644') ?? makeBits())).toBe('rw-r--r-T');
  });
});

describe('symbolicToBits', () => {
  test('parses plain symbolic notation', () => {
    const bits = symbolicToBits('rwxr-xr-x');
    expect(bits?.owner).toEqual({ execute: true, read: true, write: true });
    expect(bits?.group).toEqual({
      execute: true,
      read: true,
      write: false,
    });
    expect(bits?.setuid).toBe(false);
    expect(bits?.setgid).toBe(false);
    expect(bits?.sticky).toBe(false);
  });

  test('parses lowercase s/t as special bit plus execute', () => {
    expect(symbolicToBits('rwsr-xr-x')).toMatchObject({
      setuid: true,
    });
    expect(symbolicToBits('rwsr-xr-x')?.owner.execute).toBe(true);
    expect(symbolicToBits('rwxr-sr-x')?.setgid).toBe(true);
    expect(symbolicToBits('rwxr-xr-t')?.sticky).toBe(true);
  });

  test('parses uppercase S/T as special bit without execute', () => {
    const bits = symbolicToBits('rwSr--r--');
    expect(bits?.setuid).toBe(true);
    expect(bits?.owner.execute).toBe(false);
    expect(bits?.owner.read).toBe(true);
  });

  test('rejects wrong lengths and unknown characters', () => {
    expect(symbolicToBits('rwxr-xr')).toBeNull();
    expect(symbolicToBits('rwxr-Xr-x')).toBeNull();
    expect(symbolicToBits('')).toBeNull();
    expect(symbolicToBits('rwxr-xr-z')).toBeNull();
  });
});

describe('round-trips', () => {
  test('every example survives octal -> bits -> symbolic -> bits -> octal', () => {
    for (const example of CHMOD_EXAMPLES) {
      const bits = octalToBits(example.octal);
      expect(bits).not.toBeNull();
      const symbolic = bitsToSymbolic(bits ?? makeBits());
      const reparsed = symbolicToBits(symbolic);
      expect(reparsed).toEqual(bits);
      expect(modeToOctal(reparsed ?? makeBits())).toBe(example.octal);
    }
  });

  test('default octal is a valid mode', () => {
    expect(octalToBits(DEFAULT_CHMOD_OCTAL)).not.toBeNull();
  });
});
