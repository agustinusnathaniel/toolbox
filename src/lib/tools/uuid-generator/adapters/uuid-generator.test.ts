import { describe, expect, test } from 'vite-plus/test';

import { generateUuids, generateUuidV4 } from './uuid-generator';

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

  test.each([0, 1001, 1.5])('rejects count %s with an error', (count) => {
    const result = generateUuids({
      count,
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
