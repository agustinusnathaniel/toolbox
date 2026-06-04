import { describe, expect, test } from 'vitest';

import { calculateChargingEstimate, formatTime } from './ev-charging';

describe('calculateChargingEstimate', () => {
  describe('charging within 80% zone (endSOC <= 80%)', () => {
    test('calculates correct kWh for AC L2 20->60%', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 60,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      const expectedBase = (60 - 20) * (75 / 100);
      const expectedTotal = expectedBase / 0.9;

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
        startSOC: 10,
        endSOC: 50,
        totalCapacity: 60,
        usablePercent: 100,
        chargerType: 'dc-fast',
      });

      const expectedBase = (50 - 10) * (60 / 100);
      const expectedTotal = expectedBase / 0.92;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBe(0);
      expect(result.comparison80).toBeUndefined();
    });
  });

  describe('charging across 80% threshold (start < 80, end > 80)', () => {
    test('splits calculation for 20->100% on AC L2', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 100,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      const basePart = ((80 - 20) * 75) / 100 / 0.9;
      const topPart = ((100 - 80) * 75) / 100 / (0.9 - 0.07);
      const expectedTotal = basePart + topPart;

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
        startSOC: 50,
        endSOC: 95,
        totalCapacity: 100,
        usablePercent: 100,
        chargerType: 'ac-l1',
      });

      const basePart = ((80 - 50) * 100) / 100 / 0.87;
      const topPart = ((95 - 80) * 100) / 100 / (0.87 - 0.07);
      const expectedTotal = basePart + topPart;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBeGreaterThan(0);
      expect(result.comparison80).toBeDefined();
    });
  });

  describe('charging entirely above 80% (start >= 80)', () => {
    test('applies penalty for 80->100% on DC Ultra', () => {
      const result = calculateChargingEstimate({
        startSOC: 80,
        endSOC: 100,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'dc-ultra',
      });

      const penalizedEfficiency = 0.9 - 0.07;
      const expectedBase = (100 - 80) * (75 / 100);
      const expectedTotal = expectedBase / penalizedEfficiency;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.comparison80).toBeDefined();
      expect(result.comparison80?.kwh).toBe(0);
      expect(result.comparison80?.savings).toBe(result.totalKwh);
    });

    test('applies penalty for 85->95% on AC L2', () => {
      const result = calculateChargingEstimate({
        startSOC: 85,
        endSOC: 95,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      const penalizedEfficiency = 0.9 - 0.07;
      const expectedBase = (95 - 85) * (75 / 100);
      const expectedTotal = expectedBase / penalizedEfficiency;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
      expect(result.socPenaltyKwh).toBeGreaterThan(0);
    });
  });

  describe('all charger types', () => {
    test.each([
      ['ac-l1', 0.87],
      ['ac-l2', 0.9],
      ['dc-fast', 0.92],
      ['dc-ultra', 0.9],
    ] as const)('charger %s uses efficiency %s', (chargerType, expectedEfficiency) => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 60,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType,
      });

      const expectedBase = (60 - 20) * (75 / 100);
      const expectedTotal = expectedBase / expectedEfficiency;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });
  });

  describe('usable capacity calculation', () => {
    test('derives usableCapacity from totalCapacity and usablePercent', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 82,
        usablePercent: 92,
        chargerType: 'ac-l2',
      });

      expect(result.usableCapacity).toBe(75.44);
    });

    test('uses usableCapacity in energy calculation', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 82,
        usablePercent: 92,
        chargerType: 'ac-l2',
      });

      const expectedUsable = 82 * 0.92;
      const expectedBase = (80 - 20) * (expectedUsable / 100);
      const expectedTotal = expectedBase / 0.9;

      expect(result.totalKwh).toBe(Math.round(expectedTotal * 100) / 100);
    });

    test('defaults to 100% when usablePercent is 100', () => {
      const result = calculateChargingEstimate({
        startSOC: 0,
        endSOC: 100,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.usableCapacity).toBe(75);
    });

    test('reduces usableCapacity when usablePercent is lower', () => {
      const result100 = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      const result90 = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 90,
        chargerType: 'ac-l2',
      });

      expect(result90.usableCapacity).toBeLessThan(result100.usableCapacity);
      expect(result90.totalKwh).toBeLessThan(result100.totalKwh);
    });
  });

  describe('cost calculation', () => {
    test('calculates cost when electricityRate is provided', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
        electricityRate: 0.15,
      });

      expect(result.estimatedCost).toBeDefined();
      expect(result.estimatedCost).toBe(
        Math.round(result.totalKwh * 0.15 * 100) / 100
      );
    });

    test('does not include cost when electricityRate is 0', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
        electricityRate: 0,
      });

      expect(result.estimatedCost).toBeUndefined();
    });

    test('does not include cost when electricityRate is not provided', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.estimatedCost).toBeUndefined();
    });
  });

  describe('time calculation', () => {
    test('calculates time when chargingPower is provided', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
        chargingPower: 11,
      });

      expect(result.estimatedTimeHours).toBeDefined();
      expect(result.estimatedTimeHours).toBeCloseTo(result.totalKwh / 11, 2);
    });

    test('does not include time when chargingPower is 0', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
        chargingPower: 0,
      });

      expect(result.estimatedTimeHours).toBeUndefined();
    });

    test('does not include time when chargingPower is not provided', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.estimatedTimeHours).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    test('returns 0 kWh when startSOC equals endSOC', () => {
      const result = calculateChargingEstimate({
        startSOC: 50,
        endSOC: 50,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.totalKwh).toBe(0);
      expect(result.baseKwh).toBe(0);
      expect(result.conversionLossKwh).toBe(0);
    });

    test('handles full charge 0->100%', () => {
      const result = calculateChargingEstimate({
        startSOC: 0,
        endSOC: 100,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.totalKwh).toBeGreaterThan(75);
      expect(result.comparison80).toBeDefined();
      expect(result.comparison80?.savings).toBeGreaterThan(0);
    });

    test('comparison80 is undefined when endSOC <= 80', () => {
      const result = calculateChargingEstimate({
        startSOC: 20,
        endSOC: 80,
        totalCapacity: 75,
        usablePercent: 100,
        chargerType: 'ac-l2',
      });

      expect(result.comparison80).toBeUndefined();
    });
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
