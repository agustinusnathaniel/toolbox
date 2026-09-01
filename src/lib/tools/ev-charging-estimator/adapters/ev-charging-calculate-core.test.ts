import { describe, expect, test } from 'vite-plus/test';

import { calculateChargingEstimate } from './ev-charging';

// Expected kWh values are golden literals pinned to the calibrated efficiency
// constants in ev-charging.ts. When recalibration is done deliberately, update
// these numbers in the same change.
describe('calculateChargingEstimate - core charging zones', () => {
  describe('charging within 80% zone (endSOC <= 80%)', () => {
    test('calculates kWh for AC L2 20->60%', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l2',
        endSOC: 60,
        startSOC: 20,
        totalCapacity: 75,
        usablePercent: 100,
      });

      expect(result.baseKwh).toBe(30);
      expect(result.totalKwh).toBe(34.88);
      expect(result.conversionLossKwh).toBe(4.88);
      expect(result.socPenaltyKwh).toBe(0);
      expect(result.comparison80).toBeUndefined();
    });

    test('calculates kWh for DC Fast 10->50%', () => {
      const result = calculateChargingEstimate({
        chargerType: 'dc-fast',
        endSOC: 50,
        startSOC: 10,
        totalCapacity: 60,
        usablePercent: 100,
      });

      expect(result.baseKwh).toBe(24);
      expect(result.totalKwh).toBe(27.59);
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

      expect(result.baseKwh).toBe(60);
      expect(result.totalKwh).toBe(70.73);
      expect(result.socPenaltyKwh).toBe(0.96);
      expect(result.comparison80).toEqual({ kwh: 52.33, savings: 18.4 });
    });

    test('splits calculation for 50->95% on AC L1', () => {
      const result = calculateChargingEstimate({
        chargerType: 'ac-l1',
        endSOC: 95,
        startSOC: 50,
        totalCapacity: 100,
        usablePercent: 100,
      });

      expect(result.baseKwh).toBe(45);
      expect(result.totalKwh).toBe(55.25);
      expect(result.socPenaltyKwh).toBe(1.04);
      expect(result.comparison80).toEqual({ kwh: 36.14, savings: 19.11 });
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

      expect(result.totalKwh).toBe(18.63);
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

      expect(result.baseKwh).toBe(7.5);
      expect(result.totalKwh).toBe(9.2);
      expect(result.socPenaltyKwh).toBe(0.48);
    });
  });

  describe('all charger types', () => {
    test.each([
      ['ac-l1', 36.14],
      ['ac-l2', 34.88],
      ['dc-fast', 34.48],
      ['dc-ultra', 35.29],
    ] as const)(
      'charger %s totals %s kWh for 20->60% of a 75kWh pack',
      (chargerType, expectedTotalKwh) => {
        const result = calculateChargingEstimate({
          chargerType,
          endSOC: 60,
          startSOC: 20,
          totalCapacity: 75,
          usablePercent: 100,
        });

        expect(result.totalKwh).toBe(expectedTotalKwh);
      }
    );
  });
});
