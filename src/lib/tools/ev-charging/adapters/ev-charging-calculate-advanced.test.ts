import { describe, expect, test } from 'vite-plus/test';

import { type ChargingInputs, calculateChargingEstimate } from './ev-charging';

// Shared arrange helper: most cases only vary one or two inputs.
function chargingInput(
  overrides: Partial<ChargingInputs> = {}
): ChargingInputs {
  return {
    chargerType: 'ac-l2',
    endSOC: 80,
    startSOC: 20,
    totalCapacity: 75,
    usablePercent: 100,
    ...overrides,
  };
}

// Expected kWh values are golden literals pinned to the calibrated efficiency
// constants in ev-charging.ts. When recalibration is done deliberately, update
// these numbers in the same change.
describe('calculateChargingEstimate - calibration factor', () => {
  test('defaults to 1 when not provided', () => {
    const withoutCal = calculateChargingEstimate(chargingInput());

    const withCal1 = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 1 })
    );

    expect(withoutCal.totalKwh).toBe(withCal1.totalKwh);
  });

  test('scales totalKwh by calibration factor', () => {
    const calibrated = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 1.1 })
    );

    expect(calibrated.totalKwh).toBe(57.56);
  });

  test('scales cost by calibration factor', () => {
    const base = calculateChargingEstimate(
      chargingInput({ electricityRate: 0.15 })
    );

    const calibrated = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 1.1, electricityRate: 0.15 })
    );

    expect(calibrated.estimatedCost).toBe(8.63);
    expect(calibrated.estimatedCost).toBeGreaterThan(base.estimatedCost ?? 0);
  });

  test('scales comparison80 by calibration factor when endSOC > 80%', () => {
    const calibrated = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 1.1, endSOC: 100 })
    );

    expect(calibrated.comparison80).toEqual({ kwh: 57.56, savings: 20.25 });
  });

  test('scales socPenaltyKwh by calibration factor', () => {
    const calibrated = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 0.9, endSOC: 100 })
    );

    expect(calibrated.socPenaltyKwh).toBe(0.87);
  });

  test('baseKwh is unaffected by calibration factor', () => {
    const calibrated = calculateChargingEstimate(
      chargingInput({ calibrationFactor: 1.2 })
    );

    expect(calibrated.baseKwh).toBe(45);
  });
});

describe('calculateChargingEstimate - power-based efficiency tiers', () => {
  test('uses charger type efficiency when chargingPower is not provided', () => {
    const result = calculateChargingEstimate(chargingInput({ endSOC: 60 }));

    expect(result.totalKwh).toBe(34.88);
  });

  test('uses power-based efficiency at 10kW (0.86)', () => {
    const result = calculateChargingEstimate(
      chargingInput({ chargingPower: 10, endSOC: 60 })
    );

    expect(result.totalKwh).toBe(34.88);
  });

  test('uses power-based efficiency at 25kW (0.88)', () => {
    const result = calculateChargingEstimate(
      chargingInput({
        chargerType: 'dc-fast',
        chargingPower: 25,
        endSOC: 60,
      })
    );

    expect(result.totalKwh).toBe(34.09);
  });
});

describe('calculateChargingEstimate - high power efficiency', () => {
  test('uses power-based efficiency at 70kW (0.86)', () => {
    const result = calculateChargingEstimate(
      chargingInput({
        chargerType: 'dc-fast',
        chargingPower: 70,
        endSOC: 60,
      })
    );

    expect(result.totalKwh).toBe(34.88);
  });

  test('uses power-based efficiency at 150kW (0.87)', () => {
    const result = calculateChargingEstimate(
      chargingInput({
        chargerType: 'dc-ultra',
        chargingPower: 150,
        endSOC: 60,
      })
    );

    expect(result.totalKwh).toBe(34.48);
  });

  test('power-based efficiency can differ from charger type default', () => {
    const withPower = calculateChargingEstimate(
      chargingInput({
        chargerType: 'dc-fast',
        chargingPower: 70,
        endSOC: 60,
      })
    );

    const withoutPower = calculateChargingEstimate(
      chargingInput({ chargerType: 'dc-fast', endSOC: 60 })
    );

    // dc-fast default=0.87, 70kW=0.86 → lower efficiency means more kWh
    expect(withPower.totalKwh).toBeGreaterThan(withoutPower.totalKwh);
  });
});
