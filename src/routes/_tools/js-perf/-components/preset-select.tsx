import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import type { Preset } from '@/lib/js-perf-comp-core/presets';

export function PresetSelect({
  onPresetChange,
  presets,
  selectedPreset,
}: {
  onPresetChange: (name: string) => void;
  presets: Array<Preset>;
  selectedPreset: string;
}) {
  return (
    <Select
      onSelectionChange={(key) => onPresetChange(String(key))}
      selectedKey={selectedPreset}
    >
      <SelectTrigger className="min-w-[160px] flex-1 sm:w-[200px] sm:min-w-[200px] sm:flex-none">
        {selectedPreset}
      </SelectTrigger>
      <SelectContent items={presets}>
        {(preset) => <SelectItem id={preset.name}>{preset.name}</SelectItem>}
      </SelectContent>
    </Select>
  );
}
