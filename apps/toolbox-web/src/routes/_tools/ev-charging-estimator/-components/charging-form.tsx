import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
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
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import {
  CHARGER_LABELS,
  type ChargerType,
  calculateChargingEstimate,
  DEFAULT_USABLE_PERCENT,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';
import { copyToClipboard } from '@/lib/utils/clipboard';

import { FormulaExplanation } from './formula-explanation';
import { ResultCard } from './result-card';

const formSchema = z.object({
  startSOC: z.number().min(0).max(100),
  endSOC: z.number().min(0).max(100),
  totalCapacity: z.number().positive(),
  usablePercent: z.number().min(1).max(100),
  chargerType: z.enum(['ac-l1', 'ac-l2', 'dc-fast', 'dc-ultra']),
  electricityRate: z.number().positive().optional(),
  chargingPower: z.number().positive().optional(),
});

type FormType = z.infer<typeof formSchema>;

const CHARGER_OPTIONS: Array<{ id: ChargerType; label: string }> =
  Object.entries(CHARGER_LABELS).map(([id, label]) => ({
    id: id as ChargerType,
    label,
  }));

type ChargingFormProps = {
  onTrack: (action: string) => void;
};

export function ChargingForm({ onTrack }: ChargingFormProps) {
  const search = useSearch({ from: '/_tools/ev-charging-estimator/' });
  const navigate = useNavigate({ from: '/ev-charging-estimator/' });

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startSOC: search.start ?? 20,
      endSOC: search.end ?? 80,
      totalCapacity: search.cap ?? 75,
      usablePercent: search.usable ?? DEFAULT_USABLE_PERCENT,
      chargerType: search.type ?? 'ac-l2',
      electricityRate: search.rate,
      chargingPower: search.power,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    navigate({
      search: {
        start: watchedValues.startSOC,
        end: watchedValues.endSOC,
        cap: watchedValues.totalCapacity,
        usable: watchedValues.usablePercent,
        type: watchedValues.chargerType,
        rate: watchedValues.electricityRate,
        power: watchedValues.chargingPower,
      },
      replace: true,
    });
  }, [watchedValues, navigate]);

  const result = useMemo(
    () =>
      calculateChargingEstimate({
        startSOC: watchedValues.startSOC,
        endSOC: watchedValues.endSOC,
        totalCapacity: watchedValues.totalCapacity,
        usablePercent: watchedValues.usablePercent,
        chargerType: watchedValues.chargerType,
        electricityRate: watchedValues.electricityRate,
        chargingPower: watchedValues.chargingPower,
      }),
    [watchedValues]
  );

  const handleCopyShareableLink = () => {
    onTrack('copy_shareable');
    copyToClipboard(window.location.href, 'Copied Shareable Link');
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
                  onChange={field.onChange}
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
              render={({ field }) => (
                <NumberField
                  maxValue={100}
                  minValue={0}
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                >
                  <Label>Target SOC (%)</Label>
                  <NumberInput />
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
                  onChange={field.onChange}
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
                <div className="grid gap-3 pt-2 sm:grid-cols-3">
                  <Controller
                    control={form.control}
                    name="usablePercent"
                    render={({ field }) => (
                      <NumberField
                        maxValue={100}
                        minValue={1}
                        name={field.name}
                        onChange={field.onChange}
                        value={field.value}
                      >
                        <Label>Usable Battery %</Label>
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
                        onChange={field.onChange}
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
                        onChange={field.onChange}
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

        <ResultCard inputs={watchedValues} result={result} />
        <FormulaExplanation inputs={watchedValues} result={result} />
      </CardContent>
    </Card>
  );
}
