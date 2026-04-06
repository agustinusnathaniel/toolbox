'use client';

import { createFileRoute } from '@tanstack/react-router';
import {
  createExecutionRequest,
  DEFAULT_RUN_POLICY,
  type ExecutionResult,
  isRunable,
  type WorkerInboundMessage,
} from '@toolbox/js-perf-comp-core';
import { useCallback, useEffect, useRef, useState } from 'react';

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
import {
  buildStabilitySummaryResult,
  buildWorker,
  createWorkerErrorResult,
} from './-components/runner-utils';
import { SnippetEditors } from './-components/snippet-editors';
import type {
  ActiveRunState,
  RunState,
  StabilitySession,
} from './-components/types';

const meta = TOOL_META['js-perf-comparator'];

export const Route = createFileRoute('/tools/js-perf-comparator/')({
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
  const [runState, setRunState] = useState<RunState>('idle');
  const [resultA, setResultA] = useState<ExecutionResult | null>(null);
  const [resultB, setResultB] = useState<ExecutionResult | null>(null);
  const [workerAReady, setWorkerAReady] = useState(false);
  const [workerBReady, setWorkerBReady] = useState(false);
  const [iterations, setIterations] = useState(
    DEFAULT_RUN_POLICY.defaultIterations
  );
  const [stabilityModeEnabled, setStabilityModeEnabled] = useState(false);
  const [stabilityRounds, setStabilityRounds] = useState(
    STABILITY_DEFAULT_ROUNDS
  );
  const [stabilityProgress, setStabilityProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [setupA, setSetupA] = useState('');
  const [teardownA, setTeardownA] = useState('');
  const [setupB, setSetupB] = useState('');
  const [teardownB, setTeardownB] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const workerARef = useRef<Worker | null>(null);
  const workerBRef = useRef<Worker | null>(null);
  const workerAIdRef = useRef(0);
  const workerBIdRef = useRef(0);
  const deadlineRef = useRef<number>(DEFAULT_RUN_POLICY.deadlineMs);

  const pendingRef = useRef<Set<string>>(new Set());
  const activeRunRef = useRef<ActiveRunState>({ a: null, b: null });
  const sessionRef = useRef<StabilitySession | null>(null);

  const isReady = workerAReady && workerBReady;

  const finalizeSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      setRunState('done');
      setStabilityProgress(null);
      return;
    }

    if (session.mode === 'single') {
      setRunState('done');
      setStabilityProgress(null);
      sessionRef.current = null;
      return;
    }

    const summaryA = buildStabilitySummaryResult(
      session.codeA,
      session.iterations,
      session.roundsTotal,
      session.resultsA,
      'A'
    );
    const summaryB = buildStabilitySummaryResult(
      session.codeB,
      session.iterations,
      session.roundsTotal,
      session.resultsB,
      'B'
    );

    setResultA(summaryA);
    setResultB(summaryB);
    setRunState('done');
    setStabilityProgress(null);
    sessionRef.current = null;
  }, []);

  const startSessionRound = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      return;
    }

    if (!(workerARef.current && workerBRef.current)) {
      return;
    }

    const nextRound = session.roundsCompleted + 1;
    session.roundsCompleted = nextRound;

    if (session.mode === 'stability') {
      setStabilityProgress({
        current: nextRound,
        total: session.roundsTotal,
      });
    } else {
      setStabilityProgress(null);
    }

    const reqA = createExecutionRequest(
      session.codeA,
      session.deadlineMs,
      session.iterations,
      session.setupA,
      session.teardownA
    );
    reqA.id = `a-r${nextRound}-${reqA.id}`;

    const reqB = createExecutionRequest(
      session.codeB,
      session.deadlineMs,
      session.iterations,
      session.setupB,
      session.teardownB
    );
    reqB.id = `b-r${nextRound}-${reqB.id}`;

    activeRunRef.current = {
      a: { id: reqA.id, code: reqA.code },
      b: { id: reqB.id, code: reqB.code },
    };
    pendingRef.current = new Set([reqA.id, reqB.id]);

    const msgA: WorkerInboundMessage = { type: 'execute', payload: reqA };
    const msgB: WorkerInboundMessage = { type: 'execute', payload: reqB };

    workerARef.current.postMessage(msgA);
    workerBRef.current.postMessage(msgB);
  }, []);

  const handleRoundFinished = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      setRunState('done');
      setStabilityProgress(null);
      return;
    }

    if (
      session.mode === 'stability' &&
      session.roundsCompleted < session.roundsTotal
    ) {
      startSessionRound();
      return;
    }

    finalizeSession();
  }, [finalizeSession, startSessionRound]);

  const setupWorkers = useCallback(() => {
    const handleWorkerAReady = () => setWorkerAReady(true);
    const handleWorkerBReady = () => setWorkerBReady(true);

    const handleWorkerAResult = (id: string, result: ExecutionResult) => {
      if (!pendingRef.current.has(id)) {
        return;
      }
      pendingRef.current.delete(id);
      activeRunRef.current.a = null;
      const session = sessionRef.current;
      if (session?.mode === 'stability') {
        session.resultsA.push(result);
      } else {
        setResultA(result);
      }
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerBResult = (id: string, result: ExecutionResult) => {
      if (!pendingRef.current.has(id)) {
        return;
      }
      pendingRef.current.delete(id);
      activeRunRef.current.b = null;
      const session = sessionRef.current;
      if (session?.mode === 'stability') {
        session.resultsB.push(result);
      } else {
        setResultB(result);
      }
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerAError = (errorMessage: string | null) => {
      const runEntry = activeRunRef.current.a;
      if (runEntry && pendingRef.current.has(runEntry.id)) {
        pendingRef.current.delete(runEntry.id);
        const fallback = createWorkerErrorResult(runEntry, errorMessage);
        if (fallback) {
          const session = sessionRef.current;
          if (session?.mode === 'stability') {
            session.resultsA.push(fallback);
          } else {
            setResultA(fallback);
          }
        }
      }
      activeRunRef.current.a = null;
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    const handleWorkerBError = (errorMessage: string | null) => {
      const runEntry = activeRunRef.current.b;
      if (runEntry && pendingRef.current.has(runEntry.id)) {
        pendingRef.current.delete(runEntry.id);
        const fallback = createWorkerErrorResult(runEntry, errorMessage);
        if (fallback) {
          const session = sessionRef.current;
          if (session?.mode === 'stability') {
            session.resultsB.push(fallback);
          } else {
            setResultB(fallback);
          }
        }
      }
      activeRunRef.current.b = null;
      if (pendingRef.current.size === 0) {
        handleRoundFinished();
      }
    };

    buildWorker(
      workerARef,
      workerAIdRef,
      handleWorkerAReady,
      handleWorkerAResult,
      handleWorkerAError
    );

    buildWorker(
      workerBRef,
      workerBIdRef,
      handleWorkerBReady,
      handleWorkerBResult,
      handleWorkerBError
    );
  }, [handleRoundFinished]);

  useEffect(() => {
    setupWorkers();
    return () => {
      workerAIdRef.current += 1;
      workerBIdRef.current += 1;
      workerARef.current?.terminate();
      workerBRef.current?.terminate();
      workerARef.current = null;
      workerBRef.current = null;
      pendingRef.current.clear();
      activeRunRef.current = { a: null, b: null };
      sessionRef.current = null;
      setStabilityProgress(null);
      setWorkerAReady(false);
      setWorkerBReady(false);
    };
  }, [setupWorkers]);

  const handlePresetChange = useCallback((presetName: string) => {
    const preset = PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      setCodeA(preset.codeA);
      setCodeB(preset.codeB);
    }
  }, []);

  const handleRun = useCallback(() => {
    if (
      runState !== 'idle' ||
      !workerARef.current ||
      !workerBRef.current ||
      !isReady
    ) {
      return;
    }

    setResultA(null);
    setResultB(null);
    setRunState('running');

    const deadline = deadlineRef.current;
    const rounds = stabilityModeEnabled ? stabilityRounds : 1;
    sessionRef.current = {
      mode: stabilityModeEnabled ? 'stability' : 'single',
      roundsTotal: rounds,
      roundsCompleted: 0,
      iterations,
      deadlineMs: deadline,
      codeA,
      codeB,
      setupA,
      teardownA,
      setupB,
      teardownB,
      resultsA: [],
      resultsB: [],
    };
    startSessionRound();
  }, [
    runState,
    isReady,
    codeA,
    codeB,
    iterations,
    setupA,
    teardownA,
    setupB,
    teardownB,
    stabilityModeEnabled,
    stabilityRounds,
    startSessionRound,
  ]);

  const handleTerminate = useCallback(() => {
    workerAIdRef.current += 1;
    workerBIdRef.current += 1;
    workerARef.current?.terminate();
    workerBRef.current?.terminate();
    workerARef.current = null;
    workerBRef.current = null;
    pendingRef.current.clear();
    activeRunRef.current = { a: null, b: null };
    sessionRef.current = null;
    setStabilityProgress(null);
    setRunState('idle');
    setResultA(null);
    setResultB(null);
    setWorkerAReady(false);
    setWorkerBReady(false);
    setupWorkers();
  }, [setupWorkers]);

  const handleReset = useCallback(() => {
    pendingRef.current.clear();
    activeRunRef.current = { a: null, b: null };
    sessionRef.current = null;
    setStabilityProgress(null);
    setRunState('idle');
    setResultA(null);
    setResultB(null);
  }, []);

  const handleResetToPreset = useCallback(() => {
    const preset = PRESETS.find((p) => p.name === selectedPreset);
    if (preset) {
      setCodeA(preset.codeA);
      setCodeB(preset.codeB);
    }
    pendingRef.current.clear();
    activeRunRef.current = { a: null, b: null };
    sessionRef.current = null;
    setStabilityProgress(null);
    setRunState('idle');
    setResultA(null);
    setResultB(null);
  }, [selectedPreset]);

  const canRun =
    isRunable(codeA) && isRunable(codeB) && runState === 'idle' && isReady;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          description="Compare execution behavior of two JavaScript snippets using parallel sandboxed QuickJS runtimes."
          title="JS Performance Comparator"
        />
        <CardContent className="flex flex-col gap-4">
          <ComparatorConfigBar
            iterations={iterations}
            onIterationsChange={setIterations}
            onPresetChange={handlePresetChange}
            onResetToPreset={handleResetToPreset}
            onStabilityModeChange={setStabilityModeEnabled}
            onStabilityRoundsChange={setStabilityRounds}
            presets={PRESETS}
            runState={runState}
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
            isReady={isReady}
            onReset={handleReset}
            onRun={handleRun}
            onStop={handleTerminate}
            runState={runState}
            stabilityProgress={stabilityProgress}
          />
        </CardContent>
      </Card>

      <ComparisonResults
        resultA={resultA}
        resultB={resultB}
        runState={runState}
      />

      <ComparatorHelp />
    </div>
  );
}
