import { zodResolver } from '@hookform/resolvers/zod';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { Form } from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { FieldError, Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  CHARGER_DEFAULT_POWER,
  CHARGER_LABELS,
  type ChargerType,
  calculateChargingEstimate,
  DEFAULT_CALIBRATION_FACTOR,
  DEFAULT_CHARGING_POWER,
  DEFAULT_USABLE_PERCENT,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';
import { copyToClipboard } from '@/lib/utils/clipboard';

import { FormulaExplanation } from './formula-explanation';
import { ResultCard } from './result-card';

const formSchema = z
  .object({
    startSOC: z
      .number('Current SOC is required')
      .min(0, 'Must be at least 0%')
      .max(100, 'Must be at most 100%'),
    endSOC: z
      .number('Target SOC is required')
      .min(0, 'Must be at least 0%')
      .max(100, 'Must be at most 100%'),
    totalCapacity: z
      .number('Battery capacity is required')
      .positive('Must be a positive number'),
    usablePercent: z
      .number('Usable battery % is required')
      .min(1, 'Must be at least 1%')
      .max(100, 'Must be at most 100%'),
    calibrationFactor: z
      .number('Calibration factor is required')
      .min(0.5, 'Must be at least 0.5')
      .max(1.5, 'Must be at most 1.5'),
    chargerType: z.enum(['ac-l1', 'ac-l2', 'dc-fast', 'dc-ultra']),
    electricityRate: z.number().positive().optional(),
    chargingPower: z.number().positive().optional(),
  })
  .refine((data) => data.endSOC >= data.startSOC, {
    message: 'Target SOC must be ≥ Current SOC',
    path: ['endSOC'],
  });

type FormType = z.infer<typeof formSchema>;

const CHARGER_OPTIONS: Array<{ id: ChargerType; label: string }> =
  Object.entries(CHARGER_LABELS).map(([id, label]) => ({
    id: id as ChargerType,
    label,
  }));

const coerceNumber =
  (onChange: (value: number | undefined) => void) =>
  (e: React.FormEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    onChange(Number.isNaN(parsed) ? undefined : parsed);
  };

const STORAGE_KEY = 'toolbox:ev-charging-estimator';

type PersistedValues = {
  startSOC?: number;
  endSOC?: number;
  totalCapacity?: number;
  usablePercent?: number;
  calibrationFactor?: number;
  chargerType?: ChargerType;
  electricityRate?: number;
  chargingPower?: number;
};

const defaultValues: PersistedValues = {
  startSOC: 20,
  endSOC: 80,
  totalCapacity: 60,
  usablePercent: DEFAULT_USABLE_PERCENT,
  calibrationFactor: DEFAULT_CALIBRATION_FACTOR,
  chargerType: 'ac-l2',
  chargingPower: DEFAULT_CHARGING_POWER,
};

function allRequiredFields(
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

type ChargingFormProps = {
  onTrack: (action: string) => void;
};

export function ChargingForm({ onTrack }: ChargingFormProps) {
  const search = useSearch({ from: '/_tools/ev-charging/' });
  const [saved, setSaved] = usePersistedState<PersistedValues>(
    STORAGE_KEY,
    defaultValues
  );

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      startSOC: search.start ?? saved.startSOC ?? defaultValues.startSOC,
      endSOC: search.end ?? saved.endSOC ?? defaultValues.endSOC,
      totalCapacity:
        search.cap ?? saved.totalCapacity ?? defaultValues.totalCapacity,
      usablePercent:
        search.usable ?? saved.usablePercent ?? defaultValues.usablePercent,
      calibrationFactor:
        search.cal ??
        saved.calibrationFactor ??
        defaultValues.calibrationFactor,
      chargerType:
        search.type ?? saved.chargerType ?? defaultValues.chargerType,
      electricityRate:
        search.rate ?? saved.electricityRate ?? defaultValues.electricityRate,
      chargingPower:
        search.power ?? saved.chargingPower ?? defaultValues.chargingPower,
    },
  });

  const watchedValues = form.watch();

  const effectiveChargingPower =
    watchedValues.chargingPower ??
    CHARGER_DEFAULT_POWER[watchedValues.chargerType];

  // biome-ignore lint/correctness/useExhaustiveDependencies: startSOC triggers endSOC refinement
  useEffect(() => {
    form.trigger('endSOC');
  }, [watchedValues.startSOC, form]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaved({
        startSOC: watchedValues.startSOC,
        endSOC: watchedValues.endSOC,
        totalCapacity: watchedValues.totalCapacity,
        usablePercent: watchedValues.usablePercent,
        calibrationFactor: watchedValues.calibrationFactor,
        chargerType: watchedValues.chargerType,
        electricityRate: watchedValues.electricityRate ?? undefined,
        chargingPower: watchedValues.chargingPower ?? undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [watchedValues, setSaved]);

  const result = useMemo(() => {
    if (
      !allRequiredFields(watchedValues) ||
      watchedValues.endSOC < watchedValues.startSOC
    ) {
      return null;
    }

    return calculateChargingEstimate({
      startSOC: watchedValues.startSOC,
      endSOC: watchedValues.endSOC,
      totalCapacity: watchedValues.totalCapacity,
      usablePercent: watchedValues.usablePercent,
      calibrationFactor: watchedValues.calibrationFactor,
      chargerType: watchedValues.chargerType,
      electricityRate: watchedValues.electricityRate,
      chargingPower: effectiveChargingPower,
    });
  }, [watchedValues, effectiveChargingPower]);

  const handleCopyShareableLink = () => {
    onTrack('copy_shareable');
    const params = new URLSearchParams();
    if (watchedValues.startSOC != null) {
      params.set('start', String(watchedValues.startSOC));
    }
    if (watchedValues.endSOC != null) {
      params.set('end', String(watchedValues.endSOC));
    }
    if (watchedValues.totalCapacity != null) {
      params.set('cap', String(watchedValues.totalCapacity));
    }
    if (watchedValues.usablePercent != null) {
      params.set('usable', String(watchedValues.usablePercent));
    }
    if (watchedValues.calibrationFactor != null) {
      params.set('cal', String(watchedValues.calibrationFactor));
    }
    if (watchedValues.chargerType != null) {
      params.set('type', watchedValues.chargerType);
    }
    if (
      watchedValues.electricityRate != null &&
      watchedValues.electricityRate > 0
    ) {
      params.set('rate', String(watchedValues.electricityRate));
    }
    if (
      watchedValues.chargingPower != null &&
      watchedValues.chargingPower > 0
    ) {
      params.set('power', String(watchedValues.chargingPower));
    }
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    copyToClipboard(url, 'Copied Shareable Link');
  };

  return (
    <Card>
      <CardContent>
        <Form
          {...form}
          className="grid gap-4 text-start"
          onSubmit={(e) => {
            e.preventDefault();
            handleCopyShareableLink();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={form.control}
              name="startSOC"
              render={({ field, fieldState }) => (
                <NumberField
                  defaultValue={field.value}
                  isInvalid={!!fieldState.error}
                  maxValue={100}
                  minValue={0}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                >
                  <Label>Current SOC (%)</Label>
                  <NumberInput />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />

            <Controller
              control={form.control}
              name="endSOC"
              render={({ field, fieldState }) => (
                <NumberField
                  defaultValue={field.value}
                  isInvalid={!!fieldState.error}
                  maxValue={100}
                  minValue={0}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                >
                  <Label>Target SOC (%)</Label>
                  <NumberInput />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Controller
              control={form.control}
              name="totalCapacity"
              render={({ field, fieldState }) => (
                <NumberField
                  defaultValue={field.value}
                  isInvalid={!!fieldState.error}
                  minValue={1}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                >
                  <Label>Battery Capacity (kWh)</Label>
                  <NumberInput />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </NumberField>
              )}
            />

            <Controller
              control={form.control}
              name="chargerType"
              render={({ field }) => (
                <Select
                  name={field.name}
                  onChange={(key) => field.onChange(key as ChargerType)}
                  selectedKey={field.value}
                >
                  <Label>Charger Type</Label>
                  <SelectTrigger />
                  <SelectContent items={CHARGER_OPTIONS}>
                    {(option) => (
                      <SelectItem id={option.id}>{option.label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DisclosureGroup>
            <Disclosure>
              <DisclosureTrigger>Advanced</DisclosureTrigger>
              <DisclosurePanel>
                <div className="grid gap-3 pt-2 sm:grid-cols-4">
                  <Controller
                    control={form.control}
                    name="usablePercent"
                    render={({ field, fieldState }) => (
                      <NumberField
                        defaultValue={field.value}
                        isInvalid={!!fieldState.error}
                        maxValue={100}
                        minValue={1}
                        name={field.name}
                        onInput={coerceNumber(field.onChange)}
                      >
                        <Label>Usable Battery %</Label>
                        <NumberInput />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="calibrationFactor"
                    render={({ field, fieldState }) => (
                      <NumberField
                        defaultValue={field.value}
                        isInvalid={!!fieldState.error}
                        maxValue={1.5}
                        minValue={0.5}
                        name={field.name}
                        onInput={coerceNumber(field.onChange)}
                      >
                        <Label>Calibration Factor</Label>
                        <NumberInput />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="electricityRate"
                    render={({ field, fieldState }) => (
                      <NumberField
                        defaultValue={field.value}
                        isInvalid={!!fieldState.error}
                        minValue={0}
                        name={field.name}
                        onInput={coerceNumber((v) =>
                          field.onChange(v || undefined)
                        )}
                      >
                        <Label>Electricity Rate ($/kWh)</Label>
                        <NumberInput />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="chargingPower"
                    render={({ field, fieldState }) => (
                      <NumberField
                        defaultValue={effectiveChargingPower}
                        isInvalid={!!fieldState.error}
                        minValue={0}
                        name={field.name}
                        onInput={coerceNumber(field.onChange)}
                      >
                        <Label>Charging Power (kW)</Label>
                        <NumberInput />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </NumberField>
                    )}
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
          </DisclosureGroup>

          <Button intent="outline" size="sm" type="submit">
            Copy Shareable Link
          </Button>
        </Form>

        {result && (
          <ResultCard
            inputs={
              watchedValues as { totalCapacity: number; usablePercent: number }
            }
            result={result}
          />
        )}
        {result && (
          <FormulaExplanation
            inputs={
              watchedValues as {
                startSOC: number;
                endSOC: number;
                totalCapacity: number;
                usablePercent: number;
                calibrationFactor: number;
                chargerType: ChargerType;
                chargingPower?: number;
              }
            }
            result={result}
          />
        )}
      </CardContent>
    </Card>
  );
}
