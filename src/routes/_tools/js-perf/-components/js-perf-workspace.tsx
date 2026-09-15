'use client';

import { Check, Link } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Separator } from '@/lib/components/ui/separator';
import { DEFAULT_RUN_POLICY } from '@/lib/js-perf-comp-core/models';
import { PRESETS } from '@/lib/js-perf-comp-core/presets';

import { AdvancedScriptsSection } from './advanced-scripts-section';
import { ComparatorConfigBar } from './comparator-config-bar';
import { canRunPerf } from './js-perf-sections';
import { RunActionBar } from './run-action-bar';
import { SnippetEditors } from './snippet-editors';
import type { useJsPerfPage } from './use-js-perf-page';

type Page = ReturnType<typeof useJsPerfPage>;

export function JsPerfConfig({ page }: { page: Page }) {
  return (
    <>
      <ComparatorConfigBar
        iterations={page.iterations}
        onIterationsChange={page.setIterations}
        onPresetChange={page.handlePresetChange}
        onResetToPreset={page.handleResetToPreset}
        onStabilityModeChange={page.setStabilityModeEnabled}
        onStabilityRoundsChange={page.setStabilityRounds}
        presets={PRESETS}
        runState={page.runner.runState}
        selectedPreset={page.selectedPreset}
        showResetToPreset={page.selectedPreset !== 'Custom'}
        stabilityModeEnabled={page.stabilityModeEnabled}
        stabilityRounds={page.stabilityRounds}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          aria-label="Copy shareable link"
          intent="outline"
          onPress={page.handleCopyLink}
          size="sm"
        >
          {page.copiedKey === 'copy' ? (
            <Check className="size-4" />
          ) : (
            <Link className="size-4" />
          )}
          {page.copiedKey === 'copy' ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
      <Separator />
    </>
  );
}

export function JsPerfWorkspace({
  page,
  trackRun,
}: {
  page: Page;
  trackRun: () => void;
}) {
  const canRun = canRunPerf(
    page.codeA,
    page.codeB,
    page.runner.runState,
    page.runner.isReady
  );
  return (
    <>
      <SnippetEditors
        codeA={page.codeA}
        codeB={page.codeB}
        onCodeAChange={(value) => {
          page.setCodeA(value);
          page.setSelectedPreset('Custom');
        }}
        onCodeBChange={(value) => {
          page.setCodeB(value);
          page.setSelectedPreset('Custom');
        }}
      />
      <AdvancedScriptsSection
        onSetupAChange={page.setSetupA}
        onSetupBChange={page.setSetupB}
        onTeardownAChange={page.setTeardownA}
        onTeardownBChange={page.setTeardownB}
        onToggle={() => page.setShowAdvanced((prev) => !prev)}
        setupA={page.setupA}
        setupB={page.setupB}
        showAdvanced={page.showAdvanced}
        teardownA={page.teardownA}
        teardownB={page.teardownB}
      />
      <Separator />
      <RunActionBar
        canRun={canRun}
        deadlineMs={DEFAULT_RUN_POLICY.deadlineMs}
        isReady={page.runner.isReady}
        onReset={page.runner.reset}
        onRun={trackRun}
        onStop={page.runner.terminate}
        runState={page.runner.runState}
        stabilityProgress={page.runner.stabilityProgress}
      />
    </>
  );
}
