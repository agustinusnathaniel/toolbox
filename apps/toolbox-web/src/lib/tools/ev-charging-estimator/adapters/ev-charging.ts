export type ChargerType = 'ac-l1' | 'ac-l2' | 'dc-fast' | 'dc-ultra';

export const DEFAULT_USABLE_PERCENT = 95;

export const DEFAULT_CALIBRATION_FACTOR = 1;

export interface ChargingInputs {
  calibrationFactor?: number;
  chargerType: ChargerType;
  chargingPower?: number;
  electricityRate?: number;
  endSOC: number;
  startSOC: number;
  totalCapacity: number;
  usablePercent: number;
}

export interface ChargingResult {
  baseKwh: number;
  comparison80?: {
    kwh: number;
    savings: number;
  };
  conversionLossKwh: number;
  estimatedCost?: number;
  estimatedTimeHours?: number;
  socPenaltyKwh: number;
  totalKwh: number;
  usableCapacity: number;
}

export const CHARGER_EFFICIENCIES: Record<ChargerType, number> = {
  'ac-l1': 0.83,
  'ac-l2': 0.86,
  'dc-fast': 0.87,
  'dc-ultra': 0.85,
};

export const CHARGER_LABELS: Record<ChargerType, string> = {
  'ac-l1': 'AC Level 1 (1.4kW)',
  'ac-l2': 'AC Level 2 (7-22kW)',
  'dc-fast': 'DC Fast (50kW)',
  'dc-ultra': 'DC Ultra-fast (150kW+)',
};

export const SOC_PENALTY = 0.02;
export const SOC_THRESHOLD = 80;

export function calculateChargingEstimate(
  inputs: ChargingInputs
): ChargingResult {
  const efficiency = CHARGER_EFFICIENCIES[inputs.chargerType];
  const penalizedEfficiency = efficiency - SOC_PENALTY;
  const { startSOC, endSOC } = inputs;

  const usableCapacity = (inputs.totalCapacity * inputs.usablePercent) / 100;

  const baseKwh = (endSOC - startSOC) * (usableCapacity / 100);

  let totalKwh: number;
  let socPenaltyKwh = 0;

  if (endSOC <= SOC_THRESHOLD) {
    totalKwh = baseKwh / efficiency;
  } else if (startSOC < SOC_THRESHOLD) {
    const basePart =
      ((SOC_THRESHOLD - startSOC) * usableCapacity) / 100 / efficiency;
    const topPart =
      ((endSOC - SOC_THRESHOLD) * usableCapacity) / 100 / penalizedEfficiency;
    totalKwh = basePart + topPart;
    socPenaltyKwh =
      ((endSOC - SOC_THRESHOLD) * usableCapacity) / 100 / efficiency -
      ((endSOC - SOC_THRESHOLD) * usableCapacity) / 100 / penalizedEfficiency;
  } else {
    totalKwh = baseKwh / penalizedEfficiency;
    socPenaltyKwh = baseKwh / efficiency - baseKwh / penalizedEfficiency;
  }

  const calibration = inputs.calibrationFactor ?? 1;
  const calibratedTotalKwh = totalKwh * calibration;

  const result: ChargingResult = {
    usableCapacity: round2(usableCapacity),
    totalKwh: round2(calibratedTotalKwh),
    baseKwh: round2(baseKwh),
    conversionLossKwh: round2(calibratedTotalKwh - baseKwh),
    socPenaltyKwh: round2(Math.abs(socPenaltyKwh) * calibration),
  };

  if (inputs.electricityRate && inputs.electricityRate > 0) {
    result.estimatedCost = round2(calibratedTotalKwh * inputs.electricityRate);
  }

  if (inputs.chargingPower && inputs.chargingPower > 0) {
    result.estimatedTimeHours = calibratedTotalKwh / inputs.chargingPower;
  }

  if (endSOC > SOC_THRESHOLD) {
    const kwhAt80 =
      startSOC < SOC_THRESHOLD
        ? ((SOC_THRESHOLD - startSOC) * usableCapacity) / 100 / efficiency
        : 0;
    result.comparison80 = {
      kwh: round2(kwhAt80),
      savings: round2(calibratedTotalKwh - kwhAt80),
    };
  }

  return result;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) {
    return `${m}m`;
  }
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}
