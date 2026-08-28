import { describe, expect, test } from 'vite-plus/test';

import { calculateChargingEstimate } from './ev-charging';

describe('calculateChargingEstimate - capacity and cost', () => {
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
});
