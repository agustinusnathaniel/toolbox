import { describe, expect, test } from 'vite-plus/test';

import { calculateChargingEstimate } from './ev-charging';

describe('calculateChargingEstimate - core charging zones', () => {
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
});
