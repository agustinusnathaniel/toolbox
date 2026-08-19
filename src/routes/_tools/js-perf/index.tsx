'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Check, Link } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Separator } from '@/lib/components/ui/separator';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { DEFAULT_RUN_POLICY, isRunable } from '@/lib/js-perf-comp-core';
import {
  buildJsPerfParams,
  buildJsPerfStateFromSearch,
} from '@/lib/tools/js-perf/adapters/js-perf-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { AdvancedScriptsSection } from './-components/advanced-scripts-section';
import { ComparatorConfigBar } from './-components/comparator-config-bar';
import { ComparisonResults } from './-components/comparison-results';
import { DEFAULT_PRESET, PRESETS } from './-components/presets';
import { RunActionBar } from './-components/run-action-bar';
import { SnippetEditors } from './-components/snippet-editors';
import { useJsPerfRunner } from './-components/use-js-perf-runner';
import { meta } from './-meta';

const searchSchema = z.object({
  codeA: z.string().optional(),
  codeB: z.string().optional(),
  iterations: z.string().optional(),
  preset: z.string().optional(),
  setupA: z.string().optional(),
  setupB: z.string().optional(),
  stabilityMode: z.string().optional(),
  stabilityRounds: z.string().optional(),
  teardownA: z.string().optional(),
  teardownB: z.string().optional(),
});

export const Route = createFileRoute('/_tools/js-perf/')({
  component: JsPerfComparatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const STORAGE_KEY_PRESET = 'toolbox:js-perf-preset';
const STORAGE_KEY_ITERATIONS = 'toolbox:js-perf-iterations';

function JsPerfComparatorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'js-perf',
    'JS Perf Comparator'
  );
  const search = useSearch({ from: '/_tools/js-perf/' });
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
  const [codeA, setCodeA] = useState(initialState.codeA || currentPreset.codeA);
  const [codeB, setCodeB] = useState(initialState.codeB || currentPreset.codeB);
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

  const { copiedKey } = useCopyFeedback();
  const handleCopyLink = useCopyShareableLink(
    () =>
      buildJsPerfParams({
        codeA,
        codeB,
        iterations,
        preset: selectedPreset,
        setupA,
        setupB,
        stabilityMode: stabilityModeEnabled,
        stabilityRounds,
        teardownA,
        teardownB,
      }),
    trackAction
  );

  const runner = useJsPerfRunner({
    codeA,
    codeB,
    iterations,
    setupA,
    setupB,
    stabilityMode: stabilityModeEnabled,
    stabilityRounds,
    teardownA,
    teardownB,
  });

  const handlePresetChange = useCallback(
    (presetName: string) => {
      const preset = PRESETS.find((p) => p.name === presetName);
      if (preset) {
        trackAction('preset_change');
        setSelectedPreset(presetName);
        setCodeA(preset.codeA);
        setCodeB(preset.codeB);
      }
    },
    [setSelectedPreset, trackAction]
  );

  const handleResetToPreset = useCallback(() => {
    const preset = PRESETS.find((p) => p.name === selectedPreset);
    if (preset) {
      setCodeA(preset.codeA);
      setCodeB(preset.codeB);
    }
    runner.reset();
  }, [selectedPreset, runner.reset]);

  useEffect(() => {
    if (runner.runState === 'done') {
      trackComplete(true);
    }
  }, [runner.runState, trackComplete]);

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

          <div className="flex flex-wrap gap-2">
            <Button
              aria-label="Copy shareable link"
              intent="outline"
              onPress={handleCopyLink}
              size="sm"
            >
              {copiedKey === 'copy' ? (
                <Check className="size-4" />
              ) : (
                <Link className="size-4" />
              )}
              {copiedKey === 'copy' ? 'Copied!' : 'Copy link'}
            </Button>
          </div>

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
            onRun={() => {
              trackAction('run');
              runner.run();
            }}
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

      <ToolHelp
        faq={[
          {
            answer:
              'This tool compares controlled runtime execution, not native browser engine performance. Use it to understand code behavior differences, not benchmark browser engines. If results are close or flip between runs, enable Stability mode to aggregate multiple rounds.',
            question: 'Is the comparison accurate?',
          },
          {
            answer:
              'QuickJS is a small JavaScript engine that runs in a Web Worker. Code is sandboxed and cannot access host APIs.',
            question: 'What is QuickJS?',
          },
        ]}
        howItWorks={{
          description:
            'Compare JavaScript snippet execution in parallel sandboxed QuickJS runtimes. Both snippets run the same number of iterations and the results are compared.',
          steps: [
            'Write code in both editors',
            'Select a preset or write custom code',
            'Optional: enable Stability mode to aggregate multiple rounds',
            'Click Run Both to execute',
            'Review execution stats, confidence hints, and output',
          ],
        }}
      />
    </div>
  );
}
