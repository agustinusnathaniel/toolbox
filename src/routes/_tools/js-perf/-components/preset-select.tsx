import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
      onValueChange={(key) => onPresetChange(String(key))}
      value={selectedPreset}
    >
      <SelectTrigger
        aria-label="Benchmark preset"
        className="min-w-[160px] flex-1 sm:w-[200px] sm:min-w-[200px] sm:flex-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset.name} value={preset.name}>
            {preset.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
