import { Controller, type UseFormReturn } from 'react-hook-form';

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
import {
  CHARGER_DEFAULT_POWER,
  type ChargerType,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';

import { CHARGER_OPTIONS } from './charging-form-constants';
import { coerceNumber, type FormType } from './charging-form-schema';

type FieldsProps = {
  form: UseFormReturn<FormType>;
  effectiveChargingPower: number | undefined;
  watchedChargerType: ChargerType;
};

function SocFields({ form }: Pick<FieldsProps, 'form'>) {
  return (
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
            onChange={(v) => field.onChange(v)}
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
            onChange={(v) => field.onChange(v)}
            onInput={coerceNumber(field.onChange)}
          >
            <Label>Target SOC (%)</Label>
            <NumberInput />
            <FieldError>{fieldState.error?.message}</FieldError>
          </NumberField>
        )}
      />
    </div>
  );
}

function CapacityChargerFields({ form }: Pick<FieldsProps, 'form'>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Controller
        control={form.control}
        name="totalCapacity"
        render={({ field, fieldState }) => (
          <NumberField
            defaultValue={field.value}
            isInvalid={!!fieldState.error}
            minValue={1}
            name={field.name}
            onChange={(v) => field.onChange(v)}
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
            onChange={(key) => {
              field.onChange(key as ChargerType);
              form.setValue(
                'chargingPower',
                CHARGER_DEFAULT_POWER[key as ChargerType]
              );
            }}
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
  );
}

export function BasicFields(props: FieldsProps) {
  return (
    <>
      <SocFields form={props.form} />
      <CapacityChargerFields form={props.form} />
    </>
  );
}

function UsableCalibrationFields({ form }: Pick<FieldsProps, 'form'>) {
  return (
    <>
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
            onChange={(v) => field.onChange(v)}
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
            onChange={(v) => field.onChange(v)}
            onInput={coerceNumber(field.onChange)}
          >
            <Label>Calibration Factor</Label>
            <NumberInput />
            <FieldError>{fieldState.error?.message}</FieldError>
          </NumberField>
        )}
      />
    </>
  );
}

function RatePowerFields({
  form,
  watchedChargerType,
  effectiveChargingPower,
}: FieldsProps) {
  return (
    <>
      <Controller
        control={form.control}
        name="electricityRate"
        render={({ field, fieldState }) => (
          <NumberField
            defaultValue={field.value}
            isInvalid={!!fieldState.error}
            minValue={0}
            name={field.name}
            onChange={(v) => field.onChange(v || undefined)}
            onInput={coerceNumber((v) => field.onChange(v || undefined))}
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
            key={watchedChargerType}
            minValue={0}
            name={field.name}
            onChange={(v) => field.onChange(v)}
            onInput={coerceNumber(field.onChange)}
          >
            <Label>Charging Power (kW)</Label>
            <NumberInput />
            <FieldError>{fieldState.error?.message}</FieldError>
          </NumberField>
        )}
      />
    </>
  );
}

export function AdvancedFields(props: FieldsProps) {
  return (
    <DisclosureGroup>
      <Disclosure>
        <DisclosureTrigger>Advanced</DisclosureTrigger>
        <DisclosurePanel>
          <div className="grid gap-3 pt-2 sm:grid-cols-4">
            <UsableCalibrationFields form={props.form} />
            <RatePowerFields {...props} />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}
