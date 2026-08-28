import { describe, expect, test } from 'vite-plus/test';

import { calculateChargingEstimate } from './ev-charging';

describe('calculateChargingEstimate - edge and calibration', () => {
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
