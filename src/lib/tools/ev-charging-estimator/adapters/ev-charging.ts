export type ChargerType = 'ac-l1' | 'ac-l2' | 'dc-fast' | 'dc-ultra';

export const DEFAULT_USABLE_PERCENT = 95;

export const DEFAULT_CALIBRATION_FACTOR = 1;
export const DEFAULT_CHARGING_POWER = 22;

export const CHARGER_DEFAULT_POWER: Record<ChargerType, number> = {
  'ac-l1': 1.4,
  'ac-l2': 7,
  'dc-fast': 25,
  'dc-ultra': 85,
};

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
  efficiency: number;
  estimatedCost?: number;
  estimatedTimeHours?: number;
  socPenaltyKwh: number;
  totalKwh: number;
  usableCapacity: number;
}

const CHARGER_EFFICIENCIES: Record<ChargerType, number> = {
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

// Power-based efficiency lookup (kW → efficiency)
// Calibrated from Jaecoo J5 data (7 sessions, Apr-Jul 2026)
// Note: 30-50 kW band has no direct data; set to adjacent 10-30 kW value (0.88).
const POWER_EFFICIENCY_TABLE: Array<{ maxKw: number; efficiency: number }> = [
  { maxKw: 10, efficiency: 0.86 },
  { maxKw: 30, efficiency: 0.88 },
  { maxKw: 50, efficiency: 0.88 },
  { maxKw: 80, efficiency: 0.86 },
  { maxKw: Number.POSITIVE_INFINITY, efficiency: 0.87 },
];

function getEfficiency(chargerType: ChargerType, powerKw?: number): number {
  if (!powerKw || powerKw <= 0) {
    return CHARGER_EFFICIENCIES[chargerType];
  }
  for (const tier of POWER_EFFICIENCY_TABLE) {
    if (powerKw <= tier.maxKw) {
      return tier.efficiency;
    }
  }
  return CHARGER_EFFICIENCIES[chargerType];
}

export const SOC_PENALTY = 0.045;
export const SOC_THRESHOLD = 80;

// Penalty above 80% SOC — all tiers use the same rate (0.045). The graduated structure is preserved for future refinement when more data is available.
export const SOC_PENALTY_90 = 0.045;
export const SOC_PENALTY_95 = 0.045;

export function calculateChargingEstimate(
  inputs: ChargingInputs
): ChargingResult {
  const efficiency = getEfficiency(inputs.chargerType, inputs.chargingPower);
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
    const { topPart, penalty } = calcAboveThreshold(
      SOC_THRESHOLD,
      endSOC,
      usableCapacity,
      efficiency
    );
    totalKwh = basePart + topPart;
    socPenaltyKwh = penalty;
  } else {
    const { topPart, penalty } = calcAboveThreshold(
      startSOC,
      endSOC,
      usableCapacity,
      efficiency
    );
    totalKwh = topPart;
    socPenaltyKwh = penalty;
  }

  const calibration = inputs.calibrationFactor ?? 1;
  const calibratedTotalKwh = totalKwh * calibration;

  const result: ChargingResult = {
    usableCapacity: round2(usableCapacity),
    totalKwh: round2(calibratedTotalKwh),
    baseKwh: round2(baseKwh),
    conversionLossKwh: round2(calibratedTotalKwh - baseKwh),
    efficiency,
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
    const calibratedKwhAt80 = kwhAt80 * calibration;
    result.comparison80 = {
      kwh: round2(calibratedKwhAt80),
      savings: round2(calibratedTotalKwh - calibratedKwhAt80),
    };
  }

  return result;
}

function calcAboveThreshold(
  from: number,
  to: number,
  usableCapacity: number,
  efficiency: number
): { topPart: number; penalty: number } {
  const breakpoints = [
    { start: SOC_THRESHOLD, end: 90, penalty: SOC_PENALTY },
    { start: 90, end: 95, penalty: SOC_PENALTY_90 },
    { start: 95, end: 100, penalty: SOC_PENALTY_95 },
  ];

  let topPart = 0;
  let penalty = 0;

  for (const bp of breakpoints) {
    const segStart = Math.max(from, bp.start);
    const segEnd = Math.min(to, bp.end);
    if (segStart >= segEnd) {
      continue;
    }

    const segKwh = ((segEnd - segStart) * usableCapacity) / 100;
    const eff = efficiency - bp.penalty;
    topPart += segKwh / eff;
    penalty += segKwh / eff - segKwh / efficiency;
  }

  return { topPart, penalty };
}

export interface ChargingSearchInput {
  calibrationFactor?: number | null;
  chargerType?: string | null;
  chargingPower?: number | null;
  electricityRate?: number | null;
  endSOC?: number | null;
  startSOC?: number | null;
  totalCapacity?: number | null;
  usablePercent?: number | null;
}

export function buildChargingSearchParams(
  inputs: ChargingSearchInput
): URLSearchParams {
  const params = new URLSearchParams();
  if (inputs.startSOC != null) {
    params.set('start', String(inputs.startSOC));
  }
  if (inputs.endSOC != null) {
    params.set('end', String(inputs.endSOC));
  }
  if (inputs.totalCapacity != null) {
    params.set('cap', String(inputs.totalCapacity));
  }
  if (inputs.usablePercent != null) {
    params.set('usable', String(inputs.usablePercent));
  }
  if (inputs.calibrationFactor != null) {
    params.set('cal', String(inputs.calibrationFactor));
  }
  if (inputs.chargerType != null) {
    params.set('type', inputs.chargerType);
  }
  if (inputs.electricityRate != null && inputs.electricityRate > 0) {
    params.set('rate', String(inputs.electricityRate));
  }
  if (inputs.chargingPower != null && inputs.chargingPower > 0) {
    params.set('power', String(inputs.chargingPower));
  }
  return params;
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
