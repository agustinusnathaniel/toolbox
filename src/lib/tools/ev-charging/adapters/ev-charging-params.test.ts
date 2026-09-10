import { describe, expect, test } from 'vite-plus/test';

import { buildChargingSearchParams } from './ev-charging';

describe('buildChargingSearchParams', () => {
  test('sets all required params', () => {
    const params = buildChargingSearchParams({
      calibrationFactor: 1,
      chargerType: 'ac-l2',
      endSOC: 80,
      startSOC: 20,
      totalCapacity: 75,
      usablePercent: 95,
    });
    expect(params.get('start')).toBe('20');
    expect(params.get('end')).toBe('80');
    expect(params.get('cap')).toBe('75');
    expect(params.get('usable')).toBe('95');
    expect(params.get('cal')).toBe('1');
    expect(params.get('type')).toBe('ac-l2');
    expect(params.get('rate')).toBeNull();
    expect(params.get('power')).toBeNull();
  });

  test('includes rate and power when positive', () => {
    const params = buildChargingSearchParams({
      calibrationFactor: 1,
      chargerType: 'dc-fast',
      chargingPower: 50,
      electricityRate: 0.15,
      endSOC: 80,
      startSOC: 20,
      totalCapacity: 60,
      usablePercent: 100,
    });
    expect(params.get('rate')).toBe('0.15');
    expect(params.get('power')).toBe('50');
  });

  test('omits rate when zero or negative', () => {
    const zero = buildChargingSearchParams({
      calibrationFactor: 1,
      chargerType: 'ac-l2',
      electricityRate: 0,
      endSOC: 80,
      startSOC: 20,
      totalCapacity: 60,
      usablePercent: 100,
    });
    expect(zero.get('rate')).toBeNull();

    const neg = buildChargingSearchParams({
      calibrationFactor: 1,
      chargerType: 'ac-l2',
      electricityRate: -1,
      endSOC: 80,
      startSOC: 20,
      totalCapacity: 60,
      usablePercent: 100,
    });
    expect(neg.get('rate')).toBeNull();
  });

  test('omits power when zero or negative', () => {
    const zero = buildChargingSearchParams({
      calibrationFactor: 1,
      chargerType: 'ac-l2',
      chargingPower: 0,
      endSOC: 80,
      startSOC: 20,
      totalCapacity: 60,
      usablePercent: 100,
    });
    expect(zero.get('power')).toBeNull();
  });

  test('handles null inputs gracefully', () => {
    const params = buildChargingSearchParams({
      calibrationFactor: null,
      chargerType: null,
      endSOC: null,
      startSOC: null,
      totalCapacity: null,
      usablePercent: null,
    });
    expect(params.get('start')).toBeNull();
    expect(params.get('end')).toBeNull();
    expect(params.get('cap')).toBeNull();
    expect(params.get('usable')).toBeNull();
    expect(params.get('cal')).toBeNull();
    expect(params.get('type')).toBeNull();
    expect(params.toString()).toBe('');
  });

  test('handles partial inputs', () => {
    const params = buildChargingSearchParams({
      endSOC: 90,
      startSOC: 10,
    });
    expect(params.get('start')).toBe('10');
    expect(params.get('end')).toBe('90');
    expect(params.get('cap')).toBeNull();
    expect(params.toString()).toBe('start=10&end=90');
  });
});
