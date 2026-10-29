'use client';

import { Dices } from 'lucide-react';

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/lib/components/reui/number-field';
import { Button } from '@/lib/components/ui/button';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import type { UuidOptions } from '@/lib/tools/uuid-generator/adapters/uuid-generator';
import { UUID_VERSION_OPTIONS } from '@/lib/tools/uuid-generator/adapters/uuid-generator';

interface Props {
  clearResult: () => void;
  onGenerate: () => void;
  options: UuidOptions;
  setOptions: React.Dispatch<React.SetStateAction<UuidOptions>>;
}

export function UuidOptionsForm({
  clearResult,
  onGenerate,
  options,
  setOptions,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Field>
          <FieldLabel htmlFor="uuid-version">Version</FieldLabel>
          <Select
            onValueChange={(key) => {
              setOptions((prev) => ({
                ...prev,
                version: key as UuidOptions['version'],
              }));
              clearResult();
            }}
            value={options.version}
          >
            <SelectTrigger aria-label="UUID version" id="uuid-version">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UUID_VERSION_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="uuid-count">Count</FieldLabel>
          <NumberField
            id="uuid-count"
            max={1000}
            min={1}
            onValueChange={(value) => {
              setOptions((prev) => ({ ...prev, count: value ?? prev.count }));
              clearResult();
            }}
            value={options.count}
          >
            <NumberFieldGroup>
              <NumberFieldDecrement aria-label="Decrease count" />
              <NumberFieldInput />
              <NumberFieldIncrement aria-label="Increase count" />
            </NumberFieldGroup>
          </NumberField>
        </Field>
        <Button onClick={onGenerate} size="sm">
          <Dices className="size-4" />
          Generate
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field orientation="horizontal">
          <Checkbox
            checked={options.uppercase}
            id="uuid-uppercase"
            onCheckedChange={(selected) => {
              setOptions((prev) => ({
                ...prev,
                uppercase: selected === true,
              }));
              clearResult();
            }}
          />
          <FieldLabel htmlFor="uuid-uppercase">Uppercase (A-Z)</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            checked={options.hyphens}
            id="uuid-hyphens"
            onCheckedChange={(selected) => {
              setOptions((prev) => ({ ...prev, hyphens: selected === true }));
              clearResult();
            }}
          />
          <FieldLabel htmlFor="uuid-hyphens">Include hyphens</FieldLabel>
        </Field>
      </div>
    </>
  );
}
