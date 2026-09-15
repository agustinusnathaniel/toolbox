'use client';

import { useEffect } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';

import { useJsPerfPresets, useJsPerfShare } from './use-js-perf-actions';
import { useJsPerfRunner } from './use-js-perf-runner';
import { useJsPerfEditors, useJsPerfStoredState } from './use-js-perf-state';

export function useJsPerfPage(
  search: Parameters<
    typeof import('@/lib/tools/js-perf/adapters/js-perf-params').buildJsPerfStateFromSearch
  >[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const stored = useJsPerfStoredState(search);
  const editors = useJsPerfEditors(
    stored.initialState,
    stored.currentPreset.codeA,
    stored.currentPreset.codeB
  );
  const { copiedKey } = useCopyFeedback();
  const handleCopyLink = useJsPerfShare(stored, editors, trackAction);
  const runner = useJsPerfRunner({
    codeA: editors.codeA,
    codeB: editors.codeB,
    iterations: stored.iterations,
    setupA: editors.setupA,
    setupB: editors.setupB,
    stabilityMode: editors.stabilityModeEnabled,
    stabilityRounds: editors.stabilityRounds,
    teardownA: editors.teardownA,
    teardownB: editors.teardownB,
  });
  const presets = useJsPerfPresets(stored, editors, runner.reset, trackAction);

  useEffect(() => {
    if (runner.runState === 'done') {
      trackComplete(true);
    }
  }, [runner.runState, trackComplete]);

  return {
    codeA: editors.codeA,
    codeB: editors.codeB,
    copiedKey,
    handleCopyLink,
    handlePresetChange: presets.handlePresetChange,
    handleResetToPreset: presets.handleResetToPreset,
    iterations: stored.iterations,
    runner,
    selectedPreset: stored.selectedPreset,
    setCodeA: editors.setCodeA,
    setCodeB: editors.setCodeB,
    setIterations: stored.setIterations,
    setSelectedPreset: stored.setSelectedPreset,
    setSetupA: editors.setSetupA,
    setSetupB: editors.setSetupB,
    setShowAdvanced: editors.setShowAdvanced,
    setStabilityModeEnabled: editors.setStabilityModeEnabled,
    setStabilityRounds: editors.setStabilityRounds,
    setTeardownA: editors.setTeardownA,
    setTeardownB: editors.setTeardownB,
    setupA: editors.setupA,
    setupB: editors.setupB,
    showAdvanced: editors.showAdvanced,
    stabilityModeEnabled: editors.stabilityModeEnabled,
    stabilityRounds: editors.stabilityRounds,
    teardownA: editors.teardownA,
    teardownB: editors.teardownB,
  };
}
