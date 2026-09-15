'use client';

import { Dices } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Checkbox, CheckboxField } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
        <div className="flex flex-col gap-1">
          <Label htmlFor="uuid-version">Version</Label>
          <Select
            aria-label="UUID version"
            onSelectionChange={(key) => {
              setOptions((prev) => ({
                ...prev,
                version: key as UuidOptions['version'],
              }));
              clearResult();
            }}
            selectedKey={options.version}
          >
            <SelectTrigger />
            <SelectContent items={UUID_VERSION_OPTIONS}>
              {(option) => (
                <SelectItem id={option.id}>{option.label}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="uuid-count">Count</Label>
          <NumberField
            maxValue={1000}
            minValue={1}
            onChange={(v) => {
              setOptions((prev) => ({ ...prev, count: v ?? prev.count }));
              clearResult();
            }}
            value={options.count}
          >
            <NumberInput id="uuid-count" />
          </NumberField>
        </div>
        <Button onPress={onGenerate} size="sm">
          <Dices className="size-4" />
          Generate
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <CheckboxField
          isSelected={options.uppercase}
          onChange={(selected) => {
            setOptions((prev) => ({ ...prev, uppercase: selected }));
            clearResult();
          }}
        >
          <Checkbox>Uppercase (A-Z)</Checkbox>
        </CheckboxField>
        <CheckboxField
          isSelected={options.hyphens}
          onChange={(selected) => {
            setOptions((prev) => ({ ...prev, hyphens: selected }));
            clearResult();
          }}
        >
          <Checkbox>Include hyphens</Checkbox>
        </CheckboxField>
      </div>
    </>
  );
}
