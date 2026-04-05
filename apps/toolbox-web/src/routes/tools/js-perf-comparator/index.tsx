'use client';

import { Editor } from '@monaco-editor/react';
import { createFileRoute } from '@tanstack/react-router';
import {
  createExecutionRequest,
  DEFAULT_RUN_POLICY,
  type ExecutionResult,
  formatDuration,
  formatStatistics,
  isRunable,
  parseWorkerMessage,
  type WorkerInboundMessage,
  type WorkerOutboundMessage,
} from '@toolbox/js-perf-comp-core';
import {
  AlertCircle,
  BadgeCheck,
  BadgeX,
  CheckCircle2,
  Clock,
  HelpCircleIcon,
  InfoIcon,
  Play,
  RotateCcw,
  ShieldAlert,
  Square,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { Separator } from '@/lib/components/ui/separator';
import { TOOL_META } from '@/lib/utils/metadata';

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

interface Preset {
  codeA: string;
  codeB: string;
  description: string;
  name: string;
}

const PRESETS: Array<Preset> = [
  {
    name: 'Object Creation',
    description: 'Object literal vs new Object()',
    codeA: `// Object literal
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const obj = { id: i, value: i * 2, active: i % 2 === 0 };
}
console.log('done');`,
    codeB: `// new Object()
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const obj = new Object();
  obj.id = i;
  obj.value = i * 2;
  obj.active = i % 2 === 0;
}
console.log('done');`,
  },
  {
    name: 'Array Lookup',
    description: 'Set.has() vs Array.includes()',
    codeA: `// Set.has()
const items = new Set(['a', 'b', 'c', 'd', 'e']);
const COUNT = 100000;
let found = 0;
for (let i = 0; i < COUNT; i++) {
  if (items.has('c')) found++;
}
console.log('found:', found);`,
    codeB: `// Array.includes()
const items = ['a', 'b', 'c', 'd', 'e'];
const COUNT = 100000;
let found = 0;
for (let i = 0; i < COUNT; i++) {
  if (items.includes('c')) found++;
}
console.log('found:', found);`,
  },
  {
    name: 'Object Spread',
    description: 'Object spread vs Object.assign',
    codeA: `// Object spread
const base = { a: 1, b: 2 };
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const copy = { ...base, c: 3 };
}
console.log('done');`,
    codeB: `// Object.assign
const base = { a: 1, b: 2 };
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const copy = Object.assign({}, base, { c: 3 });
}
console.log('done');`,
  },
  {
    name: 'String Concat',
    description: 'Template literal vs string concatenation',
    codeA: `// Template literal
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const str = \`value: \${i}, doubled: \${i * 2}\`;
}
console.log('done');`,
    codeB: `// String concatenation
const COUNT = 100000;
for (let i = 0; i < COUNT; i++) {
  const str = 'value: ' + i + ', doubled: ' + (i * 2);
}
console.log('done');`,
  },
  {
    name: 'Array Methods',
    description: 'for...of vs forEach',
    codeA: `// for...of
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COUNT = 100000;
let sum = 0;
for (let i = 0; i < COUNT; i++) {
  for (const val of arr) {
    sum += val;
  }
}
console.log('sum:', sum);`,
    codeB: `// forEach
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COUNT = 100000;
let sum = 0;
for (let i = 0; i < COUNT; i++) {
  arr.forEach(val => { sum += val; });
}
console.log('sum:', sum);`,
  },
  {
    name: 'Custom',
    description: 'Write your own code',
    codeA: '// Code A - write your comparison',
    codeB: '// Code B - write your comparison',
  },
];

const DEFAULT_PRESET = PRESETS[0];

type RunState = 'idle' | 'running' | 'done';

function getDurationIndicator(
  msA: number | null,
  msB: number | null,
  which: 'a' | 'b'
): React.ReactNode {
  if (msA === null || msB === null) {
    return null;
  }
  const faster = which === 'a' ? msA < msB : msB < msA;
  const slower = which === 'a' ? msA > msB : msB > msA;
  if (faster) {
    return <BadgeCheck className="inline size-3 text-success" />;
  }
  if (slower) {
    return <BadgeX className="inline size-3 text-danger" />;
  }
  return <span>≈</span>;
}

function ComparisonEntry({
  result,
  other,
  which,
}: {
  result: ExecutionResult;
  other: ExecutionResult;
  which: 'a' | 'b';
}) {
  const showIndicator =
    result.status === 'success' &&
    other.status === 'success' &&
    result.durationMs !== null &&
    other.durationMs !== null;

  return (
    <div className="flex items-center gap-2">
      <StatusBadge result={result} />
      <span className="font-mono text-sm">
        {formatDuration(result.durationMs)}
      </span>
      {showIndicator ? (
        <span className="text-muted-fg text-xs">
          {getDurationIndicator(result.durationMs, other.durationMs, which)}
        </span>
      ) : null}
    </div>
  );
}

function StatusBadge({ result }: { result: ExecutionResult | null }) {
  if (!result) {
    return null;
  }
  switch (result.status) {
    case 'success':
      return (
        <Badge intent="success" isCircle={false}>
          <CheckCircle2 className="size-3" />
          Success
        </Badge>
      );
    case 'runtime_error':
      return (
        <Badge intent="danger" isCircle={false}>
          <XCircle className="size-3" />
          Runtime Error
        </Badge>
      );
    case 'timeout':
      return (
        <Badge intent="warning" isCircle={false}>
          <Clock className="size-3" />
          Timeout
        </Badge>
      );
    case 'terminated':
      return (
        <Badge intent="warning" isCircle={false}>
          <ShieldAlert className="size-3" />
          Terminated
        </Badge>
      );
    case 'worker_error':
      return (
        <Badge intent="danger" isCircle={false}>
          <AlertCircle className="size-3" />
          Worker Error
        </Badge>
      );
    default: {
      return (
        <Badge intent="secondary" isCircle={false}>
          <AlertCircle className="size-3" />
          Unknown
        </Badge>
      );
    }
  }
}

function ResultCard({
  label,
  result,
}: {
  label: string;
  result: ExecutionResult | null;
}) {
  return (
    <Card>
      <CardHeader title={label} />
      <CardContent className="flex flex-col gap-3">
        {result ? (
          <>
            <div className="flex items-center gap-2">
              <StatusBadge result={result} />
              <span className="font-mono text-muted-fg text-sm">
                {formatDuration(result.durationMs)}
              </span>
              {result.statistics && (
                <span className="text-muted-fg text-xs">
                  ({formatStatistics(result.statistics)})
                </span>
              )}
            </div>
            {result.errorMessage && (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-2 font-mono text-danger text-xs">
                {result.errorMessage}
              </div>
            )}
            {result.output.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-muted-fg text-xs">
                  Output:
                </span>
                <div className="flex flex-col gap-0.5 rounded-md bg-muted/50 p-2 font-mono text-xs">
                  {result.output.slice(0, 20).map((line) => (
                    <span className="text-fg" key={line}>
                      {line}
                    </span>
                  ))}
                  {result.output.length > 20 && (
                    <span className="text-muted-fg">
                      ... +{result.output.length - 20} more lines
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <span className="text-muted-fg text-sm">No result yet</span>
        )}
      </CardContent>
    </Card>
  );
}

import JsPerfWorker from './-worker/js-perf.worker.ts?worker';

function buildWorker(
  workerRef: React.RefObject<Worker | null>,
  workerIdRef: React.RefObject<number>,
  onReady: () => void,
  onResult: (id: string, result: ExecutionResult) => void,
  onError: () => void
) {
  const currentId = ++workerIdRef.current;
  const worker = new JsPerfWorker();

  worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
    if (workerIdRef.current !== currentId) {
      return;
    }
    const msg = parseWorkerMessage(event.data);
    if (!msg) {
      return;
    }
    if (msg.type === 'ready') {
      onReady();
      return;
    }
    if (msg.type === 'result') {
      onResult(msg.payload.id, msg.payload);
    }
  };

  worker.onerror = () => {
    if (workerIdRef.current !== currentId) {
      return;
    }
    onError();
  };

  workerRef.current = worker;
}

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

  const isReady = workerAReady && workerBReady;

  useEffect(() => {
    const handleWorkerAReady = () => setWorkerAReady(true);
    const handleWorkerBReady = () => setWorkerBReady(true);

    const handleWorkerAResult = (id: string, result: ExecutionResult) => {
      pendingRef.current.delete(id);
      setResultA(result);
      if (pendingRef.current.size === 0) {
        setRunState('done');
      }
    };

    const handleWorkerBResult = (id: string, result: ExecutionResult) => {
      pendingRef.current.delete(id);
      setResultB(result);
      if (pendingRef.current.size === 0) {
        setRunState('done');
      }
    };

    const handleError = () => {
      setRunState('done');
    };

    buildWorker(
      workerARef,
      workerAIdRef,
      handleWorkerAReady,
      handleWorkerAResult,
      handleError
    );

    buildWorker(
      workerBRef,
      workerBIdRef,
      handleWorkerBReady,
      handleWorkerBResult,
      handleError
    );

    return () => {
      workerAIdRef.current += 1;
      workerBIdRef.current += 1;
      workerARef.current?.terminate();
      workerBRef.current?.terminate();
      workerARef.current = null;
      workerBRef.current = null;
      setWorkerAReady(false);
      setWorkerBReady(false);
    };
  }, []);

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
    const reqA = createExecutionRequest(
      codeA,
      deadline,
      iterations,
      setupA,
      teardownA
    );
    reqA.id = `a-${reqA.id}`;
    const reqB = createExecutionRequest(
      codeB,
      deadline,
      iterations,
      setupB,
      teardownB
    );
    reqB.id = `b-${reqB.id}`;

    pendingRef.current = new Set([reqA.id, reqB.id]);

    const msgA: WorkerInboundMessage = { type: 'execute', payload: reqA };
    const msgB: WorkerInboundMessage = { type: 'execute', payload: reqB };

    workerARef.current.postMessage(msgA);
    workerBRef.current.postMessage(msgB);
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
  ]);

  const handleTerminate = useCallback(() => {
    workerAIdRef.current += 1;
    workerBIdRef.current += 1;
    workerARef.current?.terminate();
    workerBRef.current?.terminate();
    workerARef.current = null;
    workerBRef.current = null;
    pendingRef.current.clear();
    setRunState('idle');
    setResultA(null);
    setResultB(null);
    setWorkerAReady(false);
    setWorkerBReady(false);

    const handleWorkerAReady = () => setWorkerAReady(true);
    const handleWorkerBReady = () => setWorkerBReady(true);

    const handleWorkerAResult = (id: string, result: ExecutionResult) => {
      pendingRef.current.delete(id);
      setResultA(result);
      if (pendingRef.current.size === 0) {
        setRunState('done');
      }
    };

    const handleWorkerBResult = (id: string, result: ExecutionResult) => {
      pendingRef.current.delete(id);
      setResultB(result);
      if (pendingRef.current.size === 0) {
        setRunState('done');
      }
    };

    const handleError = () => {
      setRunState('done');
    };

    buildWorker(
      workerARef,
      workerAIdRef,
      handleWorkerAReady,
      handleWorkerAResult,
      handleError
    );

    buildWorker(
      workerBRef,
      workerBIdRef,
      handleWorkerBReady,
      handleWorkerBResult,
      handleError
    );
  }, []);

  const handleReset = useCallback(() => {
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
          <div className="flex items-center gap-3">
            <Select
              onSelectionChange={(key) => handlePresetChange(key as string)}
              selectedKey={selectedPreset}
            >
              <SelectTrigger className="w-[200px]">
                {selectedPreset}
              </SelectTrigger>
              <SelectContent items={PRESETS}>
                {(preset) => (
                  <SelectItem id={preset.name}>{preset.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label
                className="text-muted-fg text-sm"
                htmlFor="iterations-input"
              >
                Iterations:
              </label>
              <Input
                className="w-[80px]"
                id="iterations-input"
                max={1000}
                min={1}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value, 10);
                  if (!Number.isNaN(val) && val > 0) {
                    setIterations(Math.min(val, 1000));
                  }
                }}
                type="number"
                value={iterations}
              />
            </div>
            {selectedPreset !== 'Custom' && (
              <Button
                intent="secondary"
                isDisabled={runState === 'running'}
                onPress={handleResetToPreset}
                size="sm"
              >
                <RotateCcw className="size-4" />
                Reset to Preset
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Snippet A</span>
              <div className="overflow-hidden rounded-md border">
                <MonacoEditor
                  height="200px"
                  language="javascript"
                  onChange={(v) => {
                    setCodeA(v ?? '');
                    setSelectedPreset('Custom');
                  }}
                  value={codeA}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-sm">Snippet B</span>
              <div className="overflow-hidden rounded-md border">
                <MonacoEditor
                  height="200px"
                  language="javascript"
                  onChange={(v) => {
                    setCodeB(v ?? '');
                    setSelectedPreset('Custom');
                  }}
                  value={codeB}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button
              className="flex items-center gap-2 text-muted-fg text-sm hover:text-fg"
              onClick={() => setShowAdvanced(!showAdvanced)}
              type="button"
            >
              <span
                className={`inline-block transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              >
                &#9654;
              </span>
              {showAdvanced ? 'Hide' : 'Show'} Advanced (Setup / Teardown)
            </button>

            {showAdvanced && (
              <div className="mt-4 flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-sm">
                      Setup A (optional)
                    </span>
                    <span className="text-muted-fg text-xs">
                      Runs once before iterations (not timed)
                    </span>
                    <div className="overflow-hidden rounded-md border">
                      <MonacoEditor
                        height="100px"
                        language="javascript"
                        onChange={(v) => setSetupA(v ?? '')}
                        value={setupA}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-sm">
                      Setup B (optional)
                    </span>
                    <span className="text-muted-fg text-xs">
                      Runs once before iterations (not timed)
                    </span>
                    <div className="overflow-hidden rounded-md border">
                      <MonacoEditor
                        height="100px"
                        language="javascript"
                        onChange={(v) => setSetupB(v ?? '')}
                        value={setupB}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-sm">
                      Teardown A (optional)
                    </span>
                    <span className="text-muted-fg text-xs">
                      Runs once after iterations (not timed)
                    </span>
                    <div className="overflow-hidden rounded-md border">
                      <MonacoEditor
                        height="100px"
                        language="javascript"
                        onChange={(v) => setTeardownA(v ?? '')}
                        value={teardownA}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-sm">
                      Teardown B (optional)
                    </span>
                    <span className="text-muted-fg text-xs">
                      Runs once after iterations (not timed)
                    </span>
                    <div className="overflow-hidden rounded-md border">
                      <MonacoEditor
                        height="100px"
                        language="javascript"
                        onChange={(v) => setTeardownB(v ?? '')}
                        value={teardownB}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-muted-fg text-xs">
              <ShieldAlert className="mr-1 inline size-3" />
              Code runs in parallel sandboxed QuickJS runtimes with a{' '}
              {DEFAULT_RUN_POLICY.deadlineMs}ms deadline per snippet. Infinite
              loops will be terminated.
            </p>
            <div className="flex items-center gap-3">
              {runState === 'running' ? (
                <Button intent="danger" onPress={handleTerminate}>
                  <Square className="size-4" />
                  Stop
                </Button>
              ) : null}
              {runState === 'done' ? (
                <Button intent="secondary" onPress={handleReset}>
                  Reset
                </Button>
              ) : null}
              {runState === 'idle' ? (
                <Button
                  intent="primary"
                  isDisabled={!canRun}
                  onPress={handleRun}
                >
                  <Play className="size-4" />
                  Run Both
                </Button>
              ) : null}
              {runState === 'running' && (
                <span className="text-muted-fg text-sm">Running...</span>
              )}
              {!isReady && runState === 'idle' && (
                <span className="text-muted-fg text-sm">
                  Loading runtimes...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {resultA || resultB || runState === 'running' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ResultCard label="Result A" result={resultA} />
          <ResultCard label="Result B" result={resultB} />
        </div>
      ) : null}

      {runState === 'done' && resultA && resultB ? (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <span className="font-medium text-sm">Comparison Summary</span>
            <div className="flex items-center gap-6">
              <ComparisonEntry other={resultB} result={resultA} which="a" />
              <span className="text-muted-fg text-sm">vs</span>
              <ComparisonEntry other={resultA} result={resultB} which="b" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <DisclosureGroup>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              How it works
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>
                Compare JavaScript snippet execution in parallel sandboxed
                QuickJS runtimes. Both snippets run the same number of
                iterations and the results are compared.
              </p>
              <ul className="list-inside list-disc">
                <li>Write code in both editors</li>
                <li>Select a preset or write custom code</li>
                <li>Click Run Both to execute</li>
                <li>View execution time and output comparison</li>
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              FAQ
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">
                  Is the comparison accurate?
                </p>
                <p>
                  This tool compares controlled runtime execution, not native
                  browser engine performance. Use it to understand code behavior
                  differences, not benchmark browser engines.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">What is QuickJS?</p>
                <p>
                  QuickJS is a small JavaScript engine that runs in a Web
                  Worker. Code is sandboxed and cannot access host APIs.
                </p>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}

function MonacoEditor({
  value,
  onChange,
  language,
  height,
}: {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  height: string;
}) {
  return (
    <Editor
      height={height}
      language={language}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 8 },
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
