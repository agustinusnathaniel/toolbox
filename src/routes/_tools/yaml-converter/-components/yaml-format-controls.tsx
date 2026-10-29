import { ArrowLeftRight, Trash2 } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';

const MODE_OPTIONS: ReadonlyArray<{ id: YamlMode; label: string }> = [
  { id: 'json-to-yaml', label: 'JSON to YAML' },
  { id: 'yaml-to-json', label: 'YAML to JSON' },
];

interface YamlFormatControlsProps {
  computing: boolean;
  mode: YamlMode;
  onClear: () => void;
  onConvert: () => void;
  onModeChange: (mode: YamlMode) => void;
}

export function YamlFormatControls({
  computing,
  mode,
  onClear,
  onConvert,
  onModeChange,
}: YamlFormatControlsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <Field>
        <FieldLabel htmlFor="yaml-mode">Mode</FieldLabel>
        <Select
          onValueChange={(key) => onModeChange(key as YamlMode)}
          value={mode}
        >
          <SelectTrigger aria-label="Select option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODE_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-center gap-2">
        <Button onClick={onConvert} size="sm" variant="default">
          <ArrowLeftRight className="size-4" />
          Convert
        </Button>
        <Button onClick={onClear} size="sm" variant="outline">
          <Trash2 className="size-4" />
          Clear
        </Button>
        {computing && (
          <span aria-live="polite" className="text-muted-foreground text-xs">
            Converting…
          </span>
        )}
      </div>
    </div>
  );
}
