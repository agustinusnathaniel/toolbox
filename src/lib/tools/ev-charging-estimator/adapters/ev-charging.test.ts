import { describe, expect, test } from 'vite-plus/test';

import {
  buildChargingSearchParams,
  calculateChargingEstimate,
  formatTime,
} from './ev-charging';

describe('calculateChargingEstimate', () => {
  describe('charging within 80% zone (endSOC <= 80%)', () => {
    test('calculates correct kWh for AC L2 20->60%', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const expectedBase = (60 - 20) * (75 / 100);
      const expectedTotal = expectedBase / 0.86;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.baseKwh).toBe(Math.round(expectedBase * 100) / 100);
      expect(result.conversionLossKwh).toBe(
        Math.round((expectedTotal - expectedBase) * 100) / 100
      );
      expect(result.socPenaltyKwh).toBe(0);
      expect(result.comparison80).toBeUndefined();
    });

    test('calculates correct kWh for DC Fast 10->50%', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-fast',
        endSOC: 50,
        startSOC: 10,
        totalCapacity: 60,
        usablePercent: 100,
      });

      const expectedBase = (50 - 10) * (60 / 100);
      const expectedTotal = expectedBase / 0.87;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBe(0);
      expect(result.comparison80).toBeUndefined();
    });
  });

  describe('charging across 80% threshold (start < 80, end > 80)', () => {
    test('splits calculation for 20->100% on AC L2', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // Graduated penalty: 80-90% = 4.5pp, 90-95% = 4.5pp, 95-100% = 4.5pp
      const basePart = ((80 - 20) * 75) / 100 / 0.86;
      const seg80_90 = ((90 - 80) * 75) / 100 / (0.86 - 0.045);
      const seg90_95 = ((95 - 90) * 75) / 100 / (0.86 - 0.045);
      const seg95_100 = ((100 - 95) * 75) / 100 / (0.86 - 0.045);
      const expectedTotal = basePart + seg80_90 + seg90_95 + seg95_100;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBeGreaterThan(0);
      expect(result.comparison80).toBeDefined();
      expect(result.comparison80?.kwh).toBe(Math.round(basePart * 100) / 100);
      expect(result.comparison80?.savings).toBe(
        Math.round((expectedTotal - basePart) * 100) / 100
      );
    });

    test('splits calculation for 50->95% on AC L1', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l1',
        endSOC: 95,
        startSOC: 50,
        totalCapacity: 100,
        usablePercent: 100,
      });

      // Graduated penalty: 80-90% = 4.5pp, 90-95% = 4.5pp
      const basePart = ((80 - 50) * 100) / 100 / 0.83;
      const seg80_90 = ((90 - 80) * 100) / 100 / (0.83 - 0.045);
      const seg90_95 = ((95 - 90) * 100) / 100 / (0.83 - 0.045);
      const expectedTotal = basePart + seg80_90 + seg90_95;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBeGreaterThan(0);
      expect(result.comparison80).toBeDefined();
    });
  });

  describe('charging entirely above 80% (start >= 80)', () => {
    test('applies penalty for 80->100% on DC Ultra', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-ultra',
        endSOC: 100,
        startSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // Graduated penalty: 80-90% = 4.5pp, 90-95% = 4.5pp, 95-100% = 4.5pp
      const seg80_90 = ((90 - 80) * 75) / 100 / (0.85 - 0.045);
      const seg90_95 = ((95 - 90) * 75) / 100 / (0.85 - 0.045);
      const seg95_100 = ((100 - 95) * 75) / 100 / (0.85 - 0.045);
      const expectedTotal = seg80_90 + seg90_95 + seg95_100;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.comparison80).toBeDefined();
      expect(result.comparison80?.kwh).toBe(0);
      expect(result.comparison80?.savings).toBe(result.totalKwh);
    });

    test('applies penalty for 85->95% on AC L2', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 95,
        startSOC: 85,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // Graduated penalty: 85-90% = 4.5pp, 90-95% = 4.5pp
      const seg85_90 = ((90 - 85) * 75) / 100 / (0.86 - 0.045);
      const seg90_95 = ((95 - 90) * 75) / 100 / (0.86 - 0.045);
      const expectedTotal = seg85_90 + seg90_95;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBeGreaterThan(0);
    });
  });

  describe('all charger types', () => {
    test.each([
      ['ac-l1', 0.83],
      ['ac-l2', 0.86],
      ['dc-fast', 0.87],
      ['dc-ultra', 0.85],
    ] as const)(
      'charger %s uses efficiency %s',
      (chargerType, expectedEfficiency) => {
        const result = calculateChargingEstimate({
          chargerType,
          endSOC: 60,
          startSOC: 20,
          totalCapacity: 75,
          usablePercent: 100,
        });

        const expectedBase = (60 - 20) * (75 / 100);
        const expectedTotal = expectedBase / expectedEfficiency;

        expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      }
    );
  });

  describe('usable capacity calculation', () => {
    test('derives usableCapacity from totalCapacity and usablePercent', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 82,
        usablePercent: 92,
      });

      expect(result.usableCapacity).toBe(75.44);
    });

    test('uses usableCapacity in energy calculation', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 82,
        usablePercent: 92,
      });

      const expectedUsable = 82 * 0.92;
      const expectedBase = (80 - 20) * (expectedUsable / 100);
      const expectedTotal = expectedBase / 0.86;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('defaults to 100% when usablePercent is 100', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 0,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.usableCapacity).toBe(75);
    });

    test('reduces usableCapacity when usablePercent is lower', () => {
      const result100 = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const result90 = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 90,
      });

      expect(result90.usableCapacity).toBeLessThan(result100.usableCapacity);
      expect(result90.totalKwh).toBeLessThan(result100.totalKwh);
    });
  });

  describe('cost calculation', () => {
    test('calculates cost when electricityRate is provided', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        electricityRate: 0.15,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.estimatedCost).toBeDefined();
      expect(result.estimatedCost).toBe(
        Math.round(result.totalKwh * 0.15 * 100) / 100
      );
    });

    test('does not include cost when electricityRate is 0', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        electricityRate: 0,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.estimatedCost).toBeUndefined();
    });

    test('does not include cost when electricityRate is not provided', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.estimatedCost).toBeUndefined();
    });
  });

  describe('time calculation', () => {
    test('calculates time when chargingPower is provided', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        chargingPower: 11,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // 11kW → power-based efficiency 0.88 (from power table, ≤30kW tier)
      const expectedBase = (80 - 20) * (75 / 100);
      const expectedTotal = expectedBase / 0.88;

      expect(result.estimatedTimeHours).toBeDefined();
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.estimatedTimeHours).toBeCloseTo(result.totalKwh / 11, 2);
    });

    test('does not include time when chargingPower is 0', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        chargingPower: 0,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.estimatedTimeHours).toBeUndefined();
    });

    test('does not include time when chargingPower is not provided', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.estimatedTimeHours).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    test('returns 0 kWh when startSOC equals endSOC', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 50,
        startSOC: 50,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.totalKwh).toBe(0);
      expect(result.baseKwh).toBe(0);
      expect(result.conversionLossKwh).toBe(0);
    });

    test('handles full charge 0->100%', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 0,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.totalKwh).toBeGreaterThan(75);
      expect(result.comparison80).toBeDefined();
      expect(result.comparison80?.savings).toBeGreaterThan(0);
    });

    test('comparison80 is undefined when endSOC <= 80', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.comparison80).toBeUndefined();
    });
  });

  describe('calibration factor', () => {
    test('defaults to 1 when not provided', () => {
      const withoutCal = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const withCal1 = calculateChargingEstimate({
        calibrationFactor: 1,
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(withoutCal.totalKwh).toBe(withCal1.totalKwh);
    });

    test('scales totalKwh by calibration factor', () => {
      const base = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const calibrated = calculateChargingEstimate({
        calibrationFactor: 1.1,
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(calibrated.totalKwh).toBe(
        Math.round(base.totalKwh * 1.1 * 100) / 100
      );
    });

    test('scales cost by calibration factor', () => {
      const base = calculateChargingEstimate({
        chargerType: 'ac-l2',
        electricityRate: 0.15,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const calibrated = calculateChargingEstimate({
        calibrationFactor: 1.1,
        chargerType: 'ac-l2',
        electricityRate: 0.15,
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(calibrated.estimatedCost).toBe(
        Math.round(calibrated.totalKwh * 0.15 * 100) / 100
      );
      expect(calibrated.estimatedCost).toBeGreaterThan(base.estimatedCost ?? 0);
    });

    test('scales comparison80 by calibration factor when endSOC > 80%', () => {
      const base = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const calibrated = calculateChargingEstimate({
        calibrationFactor: 1.1,
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(base.comparison80).toBeDefined();
      expect(calibrated.comparison80).toBeDefined();

      const baseCmp = base.comparison80 as NonNullable<
        typeof base.comparison80
      >;
      const calCmp = calibrated.comparison80 as NonNullable<
        typeof calibrated.comparison80
      >;

      // kwhAt80 should be scaled by calibration
      expect(calCmp.kwh).toBe(Math.round(baseCmp.kwh * 1.1 * 100) / 100);

      // savings = totalKwh - comparison80.kwh (both calibrated)
      // Use toBeCloseTo — the code computes savings from unrounded intermediates
      // while totalKwh/kwh are already rounded, creating a ~0.01 tolerance window
      expect(calCmp.savings).toBeCloseTo(calibrated.totalKwh - calCmp.kwh, 1);
    });

    test('scales socPenaltyKwh by calibration factor', () => {
      const base = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const calibrated = calculateChargingEstimate({
        calibrationFactor: 0.9,
        chargerType: 'ac-l2',
        endSOC: 100,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(calibrated.socPenaltyKwh).toBeLessThan(base.socPenaltyKwh);
      expect(calibrated.socPenaltyKwh).toBeGreaterThan(0);
    });

    test('baseKwh is unaffected by calibration factor', () => {
      const base = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const calibrated = calculateChargingEstimate({
        calibrationFactor: 1.2,
        chargerType: 'ac-l2',
        endSOC: 80,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(calibrated.baseKwh).toBe(base.baseKwh);
    });
  });

  describe('power-based efficiency', () => {
    test('uses charger type efficiency when chargingPower is not provided', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // ac-l2 default = 0.86
      const expectedTotal = ((60 - 20) * (75 / 100)) / 0.86;
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('uses power-based efficiency at 10kW (0.86)', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        chargingPower: 10,
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const expectedTotal = ((60 - 20) * (75 / 100)) / 0.86;
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('uses power-based efficiency at 25kW (0.88)', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-fast',
        chargingPower: 25,
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const expectedTotal = ((60 - 20) * (75 / 100)) / 0.88;
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('uses power-based efficiency at 70kW (0.86)', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-fast',
        chargingPower: 70,
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const expectedTotal = ((60 - 20) * (75 / 100)) / 0.86;
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('uses power-based efficiency at 150kW (0.87)', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-ultra',
        chargingPower: 150,
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const expectedTotal = ((60 - 20) * (75 / 100)) / 0.87;
      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('power-based efficiency can differ from charger type default', () => {
      const withPower = calculateChargingEstimate({
        chargerType: 'dc-fast',
        chargingPower: 70,
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      const withoutPower = calculateChargingEstimate({
        chargerType: 'dc-fast',
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      // dc-fast default=0.87, 70kW=0.86 → different results
      expect(withPower.totalKwh).toBeGreaterThan(withoutPower.totalKwh);
    });
  });
});

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

describe('formatTime', () => {
  test('formats hours and minutes', () => {
    expect(formatTime(1.5)).toBe('1h 30m');
  });

  test('formats exact hours', () => {
    expect(formatTime(3)).toBe('3h');
  });

  test('formats minutes only', () => {
    expect(formatTime(0.5)).toBe('30m');
  });

  test('formats zero', () => {
    expect(formatTime(0)).toBe('0m');
  });

  test('formats fractional minutes', () => {
    expect(formatTime(2.75)).toBe('2h 45m');
  });
});
