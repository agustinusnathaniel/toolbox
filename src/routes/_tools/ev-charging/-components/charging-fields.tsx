import { Controller, type UseFormReturn } from 'react-hook-form';

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/lib/components/reui/number-field';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/lib/components/ui/collapsible';
import { Field, FieldError, FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import {
  CHARGER_DEFAULT_POWER,
  type ChargerType,
} from '@/lib/tools/ev-charging/adapters/ev-charging';

import { CHARGER_OPTIONS } from './charging-form-constants';
import type { FormType } from './charging-form-schema';

type FieldsProps = {
  form: UseFormReturn<FormType>;
  effectiveChargingPower: number | undefined;
  watchedChargerType: ChargerType;
};

function NumberController({
  form,
  name,
  label,
  min,
  max,
  step,
  defaultValue,
  inputKey,
}: {
  form: UseFormReturn<FormType>;
  name:
    | 'startSOC'
    | 'endSOC'
    | 'totalCapacity'
    | 'usablePercent'
    | 'calibrationFactor'
    | 'electricityRate'
    | 'chargingPower';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  inputKey?: string;
}) {
  const inputId = `ev-${name}`;
  const errorId = `ev-${name}-error`;
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <NumberField
            defaultValue={defaultValue}
            id={inputId}
            key={inputKey}
            max={max}
            min={min}
            name={field.name}
            onValueChange={(value) => field.onChange(value ?? undefined)}
            step={step}
            value={field.value ?? null}
          >
            <NumberFieldGroup aria-invalid={fieldState.invalid}>
              <NumberFieldDecrement aria-label={`Decrease ${label}`} />
              <NumberFieldInput
                aria-describedby={fieldState.error ? errorId : undefined}
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
                ref={field.ref}
              />
              <NumberFieldIncrement aria-label={`Increase ${label}`} />
            </NumberFieldGroup>
          </NumberField>
          {fieldState.error ? (
            <FieldError id={errorId}>{fieldState.error.message}</FieldError>
          ) : null}
        </Field>
      )}
    />
  );
}

function SocFields({ form }: Pick<FieldsProps, 'form'>) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberController
        form={form}
        label="Current SOC (%)"
        max={100}
        min={0}
        name="startSOC"
      />
      <NumberController
        form={form}
        label="Target SOC (%)"
        max={100}
        min={0}
        name="endSOC"
      />
    </div>
  );
}

function CapacityChargerFields({ form }: Pick<FieldsProps, 'form'>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberController
        form={form}
        label="Battery Capacity (kWh)"
        min={1}
        name="totalCapacity"
      />
      <Controller
        control={form.control}
        name="chargerType"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="ev-chargerType">Charger Type</FieldLabel>
            <Select
              name={field.name}
              onValueChange={(key) => {
                field.onChange(key as ChargerType);
                form.setValue(
                  'chargingPower',
                  CHARGER_DEFAULT_POWER[key as ChargerType]
                );
              }}
              value={field.value}
            >
              <SelectTrigger id="ev-chargerType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHARGER_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
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
      <NumberController
        form={form}
        label="Usable Battery %"
        max={100}
        min={1}
        name="usablePercent"
      />
      <NumberController
        form={form}
        label="Calibration Factor"
        max={1.5}
        min={0.5}
        name="calibrationFactor"
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
      <NumberController
        form={form}
        label="Electricity Rate ($/kWh)"
        min={0}
        name="electricityRate"
      />
      <NumberController
        defaultValue={effectiveChargingPower}
        form={form}
        inputKey={watchedChargerType}
        label="Charging Power (kW)"
        min={0}
        name="chargingPower"
      />
    </>
  );
}

export function AdvancedFields(props: FieldsProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Advanced
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-3 pt-2 sm:grid-cols-4">
          <UsableCalibrationFields form={props.form} />
          <RatePowerFields {...props} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
