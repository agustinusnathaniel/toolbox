import {
  CHARGER_LABELS,
  type ChargerType,
  DEFAULT_CALIBRATION_FACTOR,
  DEFAULT_CHARGING_POWER,
  DEFAULT_USABLE_PERCENT,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

export const CHARGER_OPTIONS: Array<{ id: ChargerType; label: string }> =
  Object.entries(CHARGER_LABELS).map(([id, label]) => ({
    id: id as ChargerType,
    label,
  }));

export const STORAGE_KEY = 'toolbox:ev-charging-estimator';

export type PersistedValues = {
  startSOC?: number;
  endSOC?: number;
  totalCapacity?: number;
  usablePercent?: number;
  calibrationFactor?: number;
  chargerType?: ChargerType;
  electricityRate?: number;
  chargingPower?: number;
};

export const defaultValues: PersistedValues = {
  calibrationFactor: DEFAULT_CALIBRATION_FACTOR,
  chargerType: 'ac-l2',
  chargingPower: DEFAULT_CHARGING_POWER,
  endSOC: 80,
  startSOC: 20,
  totalCapacity: 60,
  usablePercent: DEFAULT_USABLE_PERCENT,
};
