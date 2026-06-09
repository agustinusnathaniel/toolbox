import { zodResolver } from '@hookform/resolvers/zod';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useRef } from 'react';
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
    startSOC: z.number().min(0).max(100),
    endSOC: z.number().min(0).max(100),
    totalCapacity: z.number().positive(),
    usablePercent: z.number().min(1).max(100),
    calibrationFactor: z.number().min(0.5).max(1.5),
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

const resetOnBlur =
  (onChange: (value: number) => void, fallback: number) =>
  (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.currentTarget.value);
    if (Number.isNaN(parsed)) {
      onChange(fallback);
    }
  };

const STORAGE_KEY = 'toolbox:ev-charging-estimator';

type PersistedValues = {
  startSOC: number;
  endSOC: number;
  totalCapacity: number;
  usablePercent: number;
  calibrationFactor: number;
  chargerType: ChargerType;
  electricityRate?: number;
  chargingPower?: number;
};

const defaultValues: PersistedValues = {
  startSOC: 20,
  endSOC: 80,
  totalCapacity: 75,
  usablePercent: DEFAULT_USABLE_PERCENT,
  calibrationFactor: DEFAULT_CALIBRATION_FACTOR,
  chargerType: 'ac-l2',
  chargingPower: DEFAULT_CHARGING_POWER,
};

type ChargingFormProps = {
  onTrack: (action: string) => void;
};

export function ChargingForm({ onTrack }: ChargingFormProps) {
  const search = useSearch({ from: '/_tools/ev-charging-estimator/' });
  const [saved, setSaved] = usePersistedState<PersistedValues>(
    STORAGE_KEY,
    defaultValues
  );

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      startSOC: search.start ?? saved.startSOC,
      endSOC: search.end ?? saved.endSOC,
      totalCapacity: search.cap ?? saved.totalCapacity,
      usablePercent: search.usable ?? saved.usablePercent,
      calibrationFactor: search.cal ?? saved.calibrationFactor,
      chargerType: search.type ?? saved.chargerType,
      electricityRate: search.rate ?? saved.electricityRate,
      chargingPower: search.power ?? saved.chargingPower,
    },
  });

  const watchedValues = form.watch();
  const prevChargerType = useRef(watchedValues.chargerType);

  useEffect(() => {
    if (prevChargerType.current !== watchedValues.chargerType) {
      prevChargerType.current = watchedValues.chargerType;
      form.setValue(
        'chargingPower',
        CHARGER_DEFAULT_POWER[watchedValues.chargerType]
      );
    }
  }, [watchedValues.chargerType, form]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSaved({
        startSOC: watchedValues.startSOC,
        endSOC: watchedValues.endSOC,
        totalCapacity: watchedValues.totalCapacity,
        usablePercent: watchedValues.usablePercent,
        calibrationFactor: watchedValues.calibrationFactor,
        chargerType: watchedValues.chargerType,
        electricityRate: watchedValues.electricityRate || undefined,
        chargingPower: watchedValues.chargingPower || undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [watchedValues, setSaved]);

  const isValid = watchedValues.endSOC >= watchedValues.startSOC;

  const result = useMemo(
    () =>
      isValid
        ? calculateChargingEstimate({
            startSOC: watchedValues.startSOC,
            endSOC: watchedValues.endSOC,
            totalCapacity: watchedValues.totalCapacity,
            usablePercent: watchedValues.usablePercent,
            calibrationFactor: watchedValues.calibrationFactor,
            chargerType: watchedValues.chargerType,
            electricityRate: watchedValues.electricityRate,
            chargingPower: watchedValues.chargingPower,
          })
        : null,
    [
      isValid,
      watchedValues.startSOC,
      watchedValues.endSOC,
      watchedValues.totalCapacity,
      watchedValues.usablePercent,
      watchedValues.calibrationFactor,
      watchedValues.chargerType,
      watchedValues.electricityRate,
      watchedValues.chargingPower,
    ]
  );

  const handleCopyShareableLink = () => {
    onTrack('copy_shareable');
    const params = new URLSearchParams({
      start: String(watchedValues.startSOC),
      end: String(watchedValues.endSOC),
      cap: String(watchedValues.totalCapacity),
      usable: String(watchedValues.usablePercent),
      cal: String(watchedValues.calibrationFactor),
      type: watchedValues.chargerType,
    });
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
              render={({ field }) => (
                <NumberField
                  maxValue={100}
                  minValue={0}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                  value={field.value}
                >
                  <Label>Current SOC (%)</Label>
                  <NumberInput />
                </NumberField>
              )}
            />

            <Controller
              control={form.control}
              name="endSOC"
              render={({ field, fieldState }) => (
                <NumberField
                  isInvalid={!!fieldState.error}
                  maxValue={100}
                  minValue={0}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                  value={field.value}
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
              render={({ field }) => (
                <NumberField
                  minValue={1}
                  name={field.name}
                  onInput={coerceNumber(field.onChange)}
                  value={field.value}
                >
                  <Label>Battery Capacity (kWh)</Label>
                  <NumberInput />
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
                  value={field.value}
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
                    render={({ field }) => (
                      <NumberField
                        maxValue={100}
                        minValue={1}
                        name={field.name}
                        onBlur={resetOnBlur(
                          field.onChange,
                          DEFAULT_USABLE_PERCENT
                        )}
                        onInput={coerceNumber(field.onChange)}
                        value={field.value}
                      >
                        <Label>Usable Battery %</Label>
                        <NumberInput />
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="calibrationFactor"
                    render={({ field }) => (
                      <NumberField
                        maxValue={1.5}
                        minValue={0.5}
                        name={field.name}
                        onBlur={resetOnBlur(
                          field.onChange,
                          DEFAULT_CALIBRATION_FACTOR
                        )}
                        onInput={coerceNumber(field.onChange)}
                        value={field.value}
                      >
                        <Label>Calibration Factor</Label>
                        <NumberInput />
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="electricityRate"
                    render={({ field }) => (
                      <NumberField
                        minValue={0}
                        name={field.name}
                        onChange={(v) => field.onChange(v || undefined)}
                        value={field.value}
                      >
                        <Label>Electricity Rate ($/kWh)</Label>
                        <NumberInput />
                      </NumberField>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="chargingPower"
                    render={({ field }) => (
                      <NumberField
                        minValue={0}
                        name={field.name}
                        onBlur={resetOnBlur(
                          field.onChange,
                          CHARGER_DEFAULT_POWER[watchedValues.chargerType]
                        )}
                        onInput={coerceNumber(field.onChange)}
                        value={field.value}
                      >
                        <Label>Charging Power (kW)</Label>
                        <NumberInput />
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

        {result && <ResultCard inputs={watchedValues} result={result} />}
        {result && (
          <FormulaExplanation inputs={watchedValues} result={result} />
        )}
      </CardContent>
    </Card>
  );
}
