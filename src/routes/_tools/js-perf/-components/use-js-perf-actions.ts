'use client';

import { useCallback } from 'react';

import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { PRESETS } from '@/lib/js-perf-comp-core/presets';
import { buildJsPerfParams } from '@/lib/tools/js-perf/adapters/js-perf-params';

import type {
  useJsPerfEditors,
  useJsPerfStoredState,
} from './use-js-perf-state';

type Stored = ReturnType<typeof useJsPerfStoredState>;
type Editors = ReturnType<typeof useJsPerfEditors>;

export function useJsPerfShare(
  stored: Stored,
  editors: Editors,
  trackAction: (a: string) => void
) {
  return useCopyShareableLink(
    () =>
      buildJsPerfParams({
        codeA: editors.codeA,
        codeB: editors.codeB,
        iterations: stored.iterations,
        preset: stored.selectedPreset,
        setupA: editors.setupA,
        setupB: editors.setupB,
        stabilityMode: editors.stabilityModeEnabled,
        stabilityRounds: editors.stabilityRounds,
        teardownA: editors.teardownA,
        teardownB: editors.teardownB,
      }),
    trackAction
  );
}

export function useJsPerfPresets(
  stored: Stored,
  editors: Editors,
  reset: () => void,
  trackAction: (a: string) => void
) {
  const handlePresetChange = useCallback(
    (presetName: string) => {
      const preset = PRESETS.find((p) => p.name === presetName);
      if (preset) {
        trackAction('preset_change');
        stored.setSelectedPreset(presetName);
        editors.setCodeA(preset.codeA);
        editors.setCodeB(preset.codeB);
      }
    },
    [stored.setSelectedPreset, editors.setCodeA, editors.setCodeB, trackAction]
  );
  const handleResetToPreset = useCallback(() => {
    const preset = PRESETS.find((p) => p.name === stored.selectedPreset);
    if (preset) {
      editors.setCodeA(preset.codeA);
      editors.setCodeB(preset.codeB);
    }
    reset();
  }, [stored.selectedPreset, editors.setCodeA, editors.setCodeB, reset]);
  return { handlePresetChange, handleResetToPreset };
}
