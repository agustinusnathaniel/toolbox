import { describe, expect, test, vi } from 'vite-plus/test';

import {
  generateUuids,
  generateUuidV4,
  generateUuidV7,
} from './uuid-generator';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_HEX_32_REGEX = /^[0-9a-f]{32}$/i;
const UPPERCASE_UUID_REGEX = /^[0-9A-F-]+$/;

describe('generateUuidV4', () => {
  test('returns a valid v4 uuid', () => {
    expect(generateUuidV4()).toMatch(UUID_V4_REGEX);
  });
});

describe('generateUuidV7', () => {
  test('returns a valid v7 uuid', () => {
    expect(generateUuidV7()).toMatch(UUID_V7_REGEX);
  });

  test('is time-ordered across calls', () => {
    const t1 = 1_700_000_000_000;
    const t2 = 1_700_000_000_500;
    vi.spyOn(Date, 'now').mockReturnValue(t1);
    const first = generateUuidV7();
    vi.spyOn(Date, 'now').mockReturnValue(t2);
    const second = generateUuidV7();
    expect(first < second).toBe(true);
    vi.restoreAllMocks();
  });
});

describe('generateUuids', () => {
  test('returns the requested count of uuids', () => {
    const result = generateUuids({
      count: 5,
      hyphens: true,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(true);
    expect(result.uuids).toHaveLength(5);
  });

  test('generates unique uuids', () => {
    const result = generateUuids({
      count: 100,
      hyphens: true,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(true);
    expect(new Set(result.uuids).size).toBe(100);
  });

  test('rejects count 0 with an error', () => {
    const result = generateUuids({
      count: 0,
      hyphens: true,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Count must be between 1 and 1000');
    expect(result.uuids).toEqual([]);
  });

  test('rejects count 1001 with an error', () => {
    const result = generateUuids({
      count: 1001,
      hyphens: true,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Count must be between 1 and 1000');
    expect(result.uuids).toEqual([]);
  });

  test('rejects non-integer count with an error', () => {
    const result = generateUuids({
      count: 1.5,
      hyphens: true,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Count must be between 1 and 1000');
    expect(result.uuids).toEqual([]);
  });

  test('strips hyphens when hyphens is false', () => {
    const result = generateUuids({
      count: 5,
      hyphens: false,
      uppercase: false,
      version: 'v4',
    });
    expect(result.isValid).toBe(true);
    for (const uuid of result.uuids) {
      expect(uuid).toMatch(UUID_HEX_32_REGEX);
      expect(uuid).not.toContain('-');
    }
  });

  test('uppercases every uuid when uppercase is true', () => {
    const result = generateUuids({
      count: 5,
      hyphens: true,
      uppercase: true,
      version: 'v4',
    });
    expect(result.isValid).toBe(true);
    for (const uuid of result.uuids) {
      expect(uuid).toMatch(UPPERCASE_UUID_REGEX);
      expect(uuid).toBe(uuid.toUpperCase());
    }
  });

  test('produces version-7 uuids when version is v7', () => {
    const result = generateUuids({
      count: 5,
      hyphens: true,
      uppercase: false,
      version: 'v7',
    });
    expect(result.isValid).toBe(true);
    for (const uuid of result.uuids) {
      expect(uuid).toMatch(UUID_V7_REGEX);
    }
  });
});
