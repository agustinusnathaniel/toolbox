'use client';

import { Check, Link } from 'lucide-react';

import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { isRunable } from '@/lib/js-perf-comp-core/models';

export function JsPerfShareButton({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        aria-label="Copy shareable link"
        intent="outline"
        onPress={onCopyLink}
        size="sm"
      >
        <Link className="size-4" />
        Copy link
      </Button>
    </div>
  );
}

export function JsPerfCopyState({ copied }: { copied: boolean }) {
  return copied ? <Check className="size-4" /> : <Link className="size-4" />;
}

export function canRunPerf(
  codeA: string,
  codeB: string,
  runState: string,
  isReady: boolean
): boolean {
  return isRunable(codeA) && isRunable(codeB) && runState === 'idle' && isReady;
}

export function JsPerfHelp() {
  return (
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
  );
}
