'use client';

import { createFileRoute } from '@tanstack/react-router';
import { DEFAULT_RUN_POLICY, isRunable } from '@toolbox/js-perf-comp-core';
import { useCallback, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Separator } from '@/lib/components/ui/separator';
import { TOOL_META } from '@/lib/utils/metadata';

import { AdvancedScriptsSection } from './-components/advanced-scripts-section';
import { ComparatorConfigBar } from './-components/comparator-config-bar';
import { ComparatorHelp } from './-components/comparator-help';
import { ComparisonResults } from './-components/comparison-results';
import {
  DEFAULT_PRESET,
  PRESETS,
  STABILITY_DEFAULT_ROUNDS,
} from './-components/presets';
import { RunActionBar } from './-components/run-action-bar';
import { SnippetEditors } from './-components/snippet-editors';
import { useJsPerfRunner } from './-components/use-js-perf-runner';

const meta = TOOL_META['js-perf-comparator'];

export const Route = createFileRoute('/_tools/js-perf-comparator/')({
  component: JsPerfComparatorPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function JsPerfComparatorPage() {
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET.name);
  const [codeA, setCodeA] = useState(DEFAULT_PRESET.codeA);
  const [codeB, setCodeB] = useState(DEFAULT_PRESET.codeB);
  const [iterations, setIterations] = useState(
    DEFAULT_RUN_POLICY.defaultIterations
  );
  const [stabilityModeEnabled, setStabilityModeEnabled] = useState(false);
  const [stabilityRounds, setStabilityRounds] = useState(
    STABILITY_DEFAULT_ROUNDS
  );
  const [setupA, setSetupA] = useState('');
  const [teardownA, setTeardownA] = useState('');
  const [setupB, setSetupB] = useState('');
  const [teardownB, setTeardownB] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const runner = useJsPerfRunner({
    codeA,
    codeB,
    iterations,
    stabilityMode: stabilityModeEnabled,
    stabilityRounds,
    setupA,
    setupB,
    teardownA,
    teardownB,
  });

  const handlePresetChange = useCallback((presetName: string) => {
    const preset = PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      setCodeA(preset.codeA);
      setCodeB(preset.codeB);
    }
  }, []);

  const handleResetToPreset = useCallback(() => {
    const preset = PRESETS.find((p) => p.name === selectedPreset);
    if (preset) {
      setCodeA(preset.codeA);
      setCodeB(preset.codeB);
    }
    runner.reset();
  }, [selectedPreset, runner.reset]);

  const canRun =
    isRunable(codeA) &&
    isRunable(codeB) &&
    runner.runState === 'idle' &&
    runner.isReady;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader
          description="Compare execution behavior of two JavaScript snippets using parallel sandboxed QuickJS runtimes."
          title="JS Performance Comparator"
        />
        <CardContent className="flex flex-col gap-3 md:gap-4">
          <ComparatorConfigBar
            iterations={iterations}
            onIterationsChange={setIterations}
            onPresetChange={handlePresetChange}
            onResetToPreset={handleResetToPreset}
            onStabilityModeChange={setStabilityModeEnabled}
            onStabilityRoundsChange={setStabilityRounds}
            presets={PRESETS}
            runState={runner.runState}
            selectedPreset={selectedPreset}
            showResetToPreset={selectedPreset !== 'Custom'}
            stabilityModeEnabled={stabilityModeEnabled}
            stabilityRounds={stabilityRounds}
          />

          <Separator />

          <SnippetEditors
            codeA={codeA}
            codeB={codeB}
            onCodeAChange={(value) => {
              setCodeA(value);
              setSelectedPreset('Custom');
            }}
            onCodeBChange={(value) => {
              setCodeB(value);
              setSelectedPreset('Custom');
            }}
          />

          <AdvancedScriptsSection
            onSetupAChange={setSetupA}
            onSetupBChange={setSetupB}
            onTeardownAChange={setTeardownA}
            onTeardownBChange={setTeardownB}
            onToggle={() => setShowAdvanced((prev) => !prev)}
            setupA={setupA}
            setupB={setupB}
            showAdvanced={showAdvanced}
            teardownA={teardownA}
            teardownB={teardownB}
          />

          <Separator />

          <RunActionBar
            canRun={canRun}
            deadlineMs={DEFAULT_RUN_POLICY.deadlineMs}
            isReady={runner.isReady}
            onReset={runner.reset}
            onRun={runner.run}
            onStop={runner.terminate}
            runState={runner.runState}
            stabilityProgress={runner.stabilityProgress}
          />
        </CardContent>
      </Card>

      <ComparisonResults
        resultA={runner.resultA}
        resultB={runner.resultB}
        runState={runner.runState}
      />

      <ComparatorHelp />
    </div>
  );
}
