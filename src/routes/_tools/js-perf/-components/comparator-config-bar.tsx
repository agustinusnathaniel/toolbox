import { RotateCcw } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import {
  type Preset,
  STABILITY_MAX_ROUNDS,
  STABILITY_MIN_ROUNDS,
} from '@/lib/js-perf-comp-core/presets';

import {
  IterationsInput,
  StabilityRoundsInput,
  StabilityToggle,
} from './config-inputs';
import { PresetSelect } from './preset-select';
import type { RunState } from './types';

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

export function ComparatorConfigBar(props: ComparatorConfigBarProps) {
  const running = props.runState === 'running';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PresetSelect
        onPresetChange={props.onPresetChange}
        presets={props.presets}
        selectedPreset={props.selectedPreset}
      />
      <IterationsInput
        iterations={props.iterations}
        max={MAX_ITERATIONS}
        min={MIN_ITERATIONS}
        onChange={props.onIterationsChange}
      />
      <StabilityToggle
        checked={props.stabilityModeEnabled}
        disabled={running}
        onChange={props.onStabilityModeChange}
      />
      {props.stabilityModeEnabled ? (
        <StabilityRoundsInput
          max={STABILITY_MAX_ROUNDS}
          min={STABILITY_MIN_ROUNDS}
          onChange={props.onStabilityRoundsChange}
          rounds={props.stabilityRounds}
        />
      ) : null}
      {props.showResetToPreset ? (
        <Button
          className="ml-auto sm:ml-0"
          intent="secondary"
          isDisabled={running}
          onPress={props.onResetToPreset}
          size="sm"
        >
          <RotateCcw className="size-4" />
          Reset to Preset
        </Button>
      ) : null}
    </div>
  );
}
