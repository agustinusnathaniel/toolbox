import { describe, expect, test } from 'vite-plus/test';

import {
  bytesToHex,
  HASH_ALGORITHMS,
  hashBytes,
  hashText,
} from './hash-generator';

const SHA_256_ABC =
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const SHA_1_ABC = 'a9993e364706816aba3e25717850c26c9cd0d89d';
const SHA_256_EMPTY =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const EMPTY_TEXT_ERROR = 'Enter some text to hash';
const HEX_LENGTHS: Record<string, number> = {
  'SHA-1': 40,
  'SHA-256': 64,
  'SHA-384': 96,
  'SHA-512': 128,
};

describe('bytesToHex', () => {
  test('converts bytes to lowercase hex', () => {
    expect(bytesToHex(new Uint8Array([0xba, 0x78, 0x16]).buffer)).toBe(
      'ba7816'
    );
  });
});

describe('hashText', () => {
  test('hashes text with SHA-256', async () => {
    const result = await hashText({ algorithm: 'SHA-256', text: 'abc' });
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(SHA_256_ABC);
  });

  test('hashes text with SHA-1', async () => {
    const result = await hashText({ algorithm: 'SHA-1', text: 'abc' });
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(SHA_1_ABC);
  });

  test('returns error for empty text', async () => {
    const result = await hashText({ algorithm: 'SHA-256', text: '' });
    expect(result.isValid).toBe(false);
    expect(result.output).toBe('');
    expect(result.error).toBe(EMPTY_TEXT_ERROR);
  });

  test('returns error for whitespace-only text', async () => {
    const result = await hashText({ algorithm: 'SHA-256', text: '  \t ' });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(EMPTY_TEXT_ERROR);
  });

  test('works with every supported algorithm', async () => {
    for (const algorithm of HASH_ALGORITHMS) {
      const result = await hashText({ algorithm, text: 'abc' });
      expect(result.isValid).toBe(true);
      expect(result.output).toHaveLength(HEX_LENGTHS[algorithm]);
    }
  });
});

describe('hashBytes', () => {
  test('hashes bytes with SHA-256', async () => {
    const result = await hashBytes(new Uint8Array([97, 98, 99]), 'SHA-256');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(SHA_256_ABC);
  });

  test('hashes empty bytes with SHA-256', async () => {
    const result = await hashBytes(new Uint8Array(0), 'SHA-256');
    expect(result.isValid).toBe(true);
    expect(result.output).toBe(SHA_256_EMPTY);
  });
});
