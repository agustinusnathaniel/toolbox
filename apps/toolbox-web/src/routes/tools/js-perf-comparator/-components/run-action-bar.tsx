import { Play, ShieldAlert, Square } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';

import type { RunState } from './types';

interface RunActionBarProps {
  canRun: boolean;
  deadlineMs: number;
  isReady: boolean;
  onReset: () => void;
  onRun: () => void;
  onStop: () => void;
  runState: RunState;
  stabilityProgress: {
    current: number;
    total: number;
  } | null;
}

export function RunActionBar({
  runState,
  canRun,
  isReady,
  stabilityProgress,
  deadlineMs,
  onRun,
  onStop,
  onReset,
}: RunActionBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-fg text-xs">
        <ShieldAlert className="mr-1 inline size-3" />
        Code runs in parallel sandboxed QuickJS runtimes with a {deadlineMs}ms
        deadline per snippet. Infinite loops will be terminated.
      </p>

      <div className="flex items-center gap-3">
        {runState === 'running' ? (
          <Button intent="danger" onPress={onStop}>
            <Square className="size-4" />
            Stop
          </Button>
        ) : null}

        {runState === 'done' ? (
          <Button intent="secondary" onPress={onReset}>
            Reset
          </Button>
        ) : null}

        {runState === 'idle' ? (
          <Button intent="primary" isDisabled={!canRun} onPress={onRun}>
            <Play className="size-4" />
            Run Both
          </Button>
        ) : null}

        {runState === 'running' ? (
          <span className="text-muted-fg text-sm">
            {stabilityProgress
              ? `Running round ${stabilityProgress.current}/${stabilityProgress.total}...`
              : 'Running...'}
          </span>
        ) : null}

        {!isReady && runState === 'idle' ? (
          <span className="text-muted-fg text-sm">Loading runtimes...</span>
        ) : null}
      </div>
    </div>
  );
}
