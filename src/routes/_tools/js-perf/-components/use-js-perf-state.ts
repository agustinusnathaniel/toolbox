'use client';

import { useState } from 'react';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { DEFAULT_PRESET, PRESETS } from '@/lib/js-perf-comp-core/presets';
import { buildJsPerfStateFromSearch } from '@/lib/tools/js-perf/adapters/js-perf-params';

const STORAGE_KEY_PRESET = 'toolbox:js-perf-preset';
const STORAGE_KEY_ITERATIONS = 'toolbox:js-perf-iterations';

export function useJsPerfStoredState(
  search: Parameters<typeof buildJsPerfStateFromSearch>[0]
) {
  const initialState = buildJsPerfStateFromSearch(search);
  const [selectedPreset, setSelectedPreset] = usePersistedState(
    STORAGE_KEY_PRESET,
    initialState.preset
  );
  const [iterations, setIterations] = usePersistedState(
    STORAGE_KEY_ITERATIONS,
    initialState.iterations
  );
  const currentPreset =
    PRESETS.find((p) => p.name === selectedPreset) ?? DEFAULT_PRESET;
  return {
    currentPreset,
    initialState,
    iterations,
    selectedPreset,
    setIterations,
    setSelectedPreset,
  };
}

export function useJsPerfEditors(
  initialState: {
    codeA: string;
    codeB: string;
    setupA: string;
    setupB: string;
    stabilityMode: boolean;
    stabilityRounds: number;
    teardownA: string;
    teardownB: string;
  },
  fallbackA: string,
  fallbackB: string
) {
  const [codeA, setCodeA] = useState(initialState.codeA || fallbackA);
  const [codeB, setCodeB] = useState(initialState.codeB || fallbackB);
  const [stabilityModeEnabled, setStabilityModeEnabled] = useState(
    initialState.stabilityMode
  );
  const [stabilityRounds, setStabilityRounds] = useState(
    initialState.stabilityRounds
  );
  const [setupA, setSetupA] = useState(initialState.setupA);
  const [teardownA, setTeardownA] = useState(initialState.teardownA);
  const [setupB, setSetupB] = useState(initialState.setupB);
  const [teardownB, setTeardownB] = useState(initialState.teardownB);
  const [showAdvanced, setShowAdvanced] = useState(false);
  return {
    codeA,
    codeB,
    setCodeA,
    setCodeB,
    setSetupA,
    setSetupB,
    setShowAdvanced,
    setStabilityModeEnabled,
    setStabilityRounds,
    setTeardownA,
    setTeardownB,
    setupA,
    setupB,
    showAdvanced,
    stabilityModeEnabled,
    stabilityRounds,
    teardownA,
    teardownB,
  };
}
