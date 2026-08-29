import { z } from 'zod';

import type { ChargerType } from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

export const formSchema = z
  .object({
    calibrationFactor: z
      .number('Calibration factor is required')
      .min(0.5, 'Must be at least 0.5')
      .max(1.5, 'Must be at most 1.5'),
    chargerType: z.enum(['ac-l1', 'ac-l2', 'dc-fast', 'dc-ultra']),
    chargingPower: z.number().positive().optional(),
    electricityRate: z.number().positive().optional(),
    endSOC: z
      .number('Target SOC is required')
      .min(0, 'Must be at least 0%')
      .max(100, 'Must be at most 100%'),
    startSOC: z
      .number('Current SOC is required')
      .min(0, 'Must be at least 0%')
      .max(100, 'Must be at most 100%'),
    totalCapacity: z
      .number('Battery capacity is required')
      .positive('Must be a positive number'),
    usablePercent: z
      .number('Usable battery % is required')
      .min(1, 'Must be at least 1%')
      .max(100, 'Must be at most 100%'),
  })
  .refine((data) => data.endSOC >= data.startSOC, {
    message: 'Target SOC must be ≥ Current SOC',
    path: ['endSOC'],
  });

export type FormType = z.infer<typeof formSchema>;

export function allRequiredFields(
  v: FormType
): v is FormType &
  Record<
    | 'startSOC'
    | 'endSOC'
    | 'totalCapacity'
    | 'usablePercent'
    | 'calibrationFactor',
    number
  > & { chargerType: ChargerType } {
  return (
    v.startSOC != null &&
    v.endSOC != null &&
    v.totalCapacity != null &&
    v.usablePercent != null &&
    v.calibrationFactor != null &&
    v.chargerType != null
  );
}

export const coerceNumber =
  (onChange: (value: number | undefined) => void) =>
  (e: React.FormEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    onChange(Number.isNaN(parsed) ? undefined : parsed);
  };
