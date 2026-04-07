import { RotateCcw } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';

import { STABILITY_MAX_ROUNDS, STABILITY_MIN_ROUNDS } from './presets';
import type { Preset, RunState } from './types';

const MAX_ITERATIONS = 1000;
const MIN_ITERATIONS = 1;

interface ComparatorConfigBarProps {
  iterations: number;
  onIterationsChange: (iterations: number) => void;
  onPresetChange: (presetName: string) => void;
  onResetToPreset: () => void;
  onStabilityModeChange: (enabled: boolean) => void;
  onStabilityRoundsChange: (rounds: number) => void;
  presets: Array<Preset>;
  runState: RunState;
  selectedPreset: string;
  showResetToPreset: boolean;
  stabilityModeEnabled: boolean;
  stabilityRounds: number;
}

export function ComparatorConfigBar({
  selectedPreset,
  presets,
  runState,
  iterations,
  stabilityModeEnabled,
  stabilityRounds,
  showResetToPreset,
  onPresetChange,
  onIterationsChange,
  onStabilityModeChange,
  onStabilityRoundsChange,
  onResetToPreset,
}: ComparatorConfigBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
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

      <div className="flex items-center gap-2">
        <label className="text-muted-fg text-sm" htmlFor="iterations-input">
          Iterations:
        </label>
        <Input
          className="w-[72px]"
          id="iterations-input"
          max={MAX_ITERATIONS}
          min={MIN_ITERATIONS}
          onChange={(event) => {
            const value = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(value)) {
              onIterationsChange(
                Math.max(MIN_ITERATIONS, Math.min(value, MAX_ITERATIONS))
              );
            }
          }}
          type="number"
          value={iterations}
        />
      </div>

      <label
        className="flex cursor-pointer items-center gap-2 text-muted-fg text-sm"
        htmlFor="stability-mode-input"
      >
        <input
          checked={stabilityModeEnabled}
          className="size-4"
          disabled={runState === 'running'}
          id="stability-mode-input"
          onChange={(event) => onStabilityModeChange(event.target.checked)}
          type="checkbox"
        />
        Stability mode
      </label>

      {stabilityModeEnabled ? (
        <div className="flex items-center gap-2">
          <label
            className="text-muted-fg text-sm"
            htmlFor="stability-rounds-input"
          >
            Rounds:
          </label>
          <Input
            className="w-[72px]"
            id="stability-rounds-input"
            max={STABILITY_MAX_ROUNDS}
            min={STABILITY_MIN_ROUNDS}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(value)) {
                onStabilityRoundsChange(
                  Math.max(
                    STABILITY_MIN_ROUNDS,
                    Math.min(value, STABILITY_MAX_ROUNDS)
                  )
                );
              }
            }}
            type="number"
            value={stabilityRounds}
          />
        </div>
      ) : null}

      {showResetToPreset ? (
        <Button
          className="ml-auto sm:ml-0"
          intent="secondary"
          isDisabled={runState === 'running'}
          onPress={onResetToPreset}
          size="sm"
        >
          <RotateCcw className="size-4" />
          Reset to Preset
        </Button>
      ) : null}
    </div>
  );
}
