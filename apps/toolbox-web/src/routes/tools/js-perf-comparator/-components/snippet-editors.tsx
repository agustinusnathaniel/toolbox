import { Suspense } from 'react';

import { Skeleton } from '@/lib/components/ui/skeleton';

import { MonacoEditor } from './monaco-editor';

interface SnippetEditorsProps {
  codeA: string;
  codeB: string;
  onCodeAChange: (value: string) => void;
  onCodeBChange: (value: string) => void;
}

export function SnippetEditors({
  codeA,
  codeB,
  onCodeAChange,
  onCodeBChange,
}: SnippetEditorsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Snippet A</span>
        <div className="overflow-hidden rounded-md border">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <MonacoEditor
              height="200px"
              language="javascript"
              onChange={(value) => onCodeAChange(value ?? '')}
              value={codeA}
            />
          </Suspense>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-sm">Snippet B</span>
        <div className="overflow-hidden rounded-md border">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <MonacoEditor
              height="200px"
              language="javascript"
              onChange={(value) => onCodeBChange(value ?? '')}
              value={codeB}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
