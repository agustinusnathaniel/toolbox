import { ArrowLeftRight, Trash2 } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
      <div className="flex flex-col gap-1">
        <Label htmlFor="yaml-mode">Mode</Label>
        <Select
          aria-label="Conversion mode"
          onSelectionChange={(key) => onModeChange(key as YamlMode)}
          selectedKey={mode}
        >
          <SelectTrigger id="yaml-mode" />
          <SelectContent items={MODE_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button intent="primary" onPress={onConvert} size="sm">
          <ArrowLeftRight className="size-4" />
          Convert
        </Button>
        <Button intent="outline" onPress={onClear} size="sm">
          <Trash2 className="size-4" />
          Clear
        </Button>
        {computing && (
          <span aria-live="polite" className="text-muted-fg text-xs">
            Converting…
          </span>
        )}
      </div>
    </div>
  );
}
