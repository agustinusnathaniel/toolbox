import { describe, expect, test } from 'vite-plus/test';

import {
  buildMeetingParams,
  parseCitiesParam,
  parseHourParam,
  parseMeetingParams,
} from './meeting-time-finder-params';

describe('parseCitiesParam', () => {
  test('round-trips custom work hours', () => {
    const cities = parseCitiesParam('asia/jakarta:8:16,america/new_york:9:17');
    expect(cities).toHaveLength(2);
    expect(cities[0]).toMatchObject({
      id: 'asia/jakarta',
      workEnd: 16,
      workStart: 8,
    });
    expect(cities[1]).toMatchObject({
      id: 'america/new_york',
      workEnd: 17,
      workStart: 9,
    });
  });

  test('drops unknown ids but keeps the rest', () => {
    const cities = parseCitiesParam('nope:9:17,asia/tokyo:9:17');
    expect(cities.map((c) => c.id)).toEqual(['asia/tokyo']);
  });

  test('falls back to defaults on invalid hours', () => {
    const cities = parseCitiesParam('asia/tokyo:xx:99');
    expect(cities).toHaveLength(1);
    expect(cities[0].workStart).toBe(9);
    expect(cities[0].workEnd).toBe(17);
  });

  test('empty input yields no cities', () => {
    expect(parseCitiesParam(undefined)).toEqual([]);
    expect(parseCitiesParam('')).toEqual([]);
  });
});

describe('parseHourParam', () => {
  test('accepts 0-23, rejects the rest', () => {
    expect(parseHourParam('14')).toBe(14);
    expect(parseHourParam('0')).toBe(0);
    expect(parseHourParam(undefined)).toBeNull();
    expect(parseHourParam('24')).toBeNull();
    expect(parseHourParam('abc')).toBeNull();
  });
});

describe('meeting params round-trip', () => {
  test('build output parses back to the same state', () => {
    const before = parseCitiesParam('asia/jakarta:8:16,europe/london:9:17');
    const params = buildMeetingParams(before, 120, 14);
    const after = parseMeetingParams(Object.fromEntries(params.entries()));
    expect(after.duration).toBe(120);
    expect(after.hour).toBe(14);
    expect(after.cities).toMatchObject([
      { id: 'asia/jakarta', workEnd: 16, workStart: 8 },
      { id: 'europe/london', workEnd: 17, workStart: 9 },
    ]);
  });
});
