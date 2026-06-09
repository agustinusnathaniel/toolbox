import { Suspense } from 'react';

import { Skeleton } from '@/lib/components/ui/skeleton';

import { MonacoEditor } from './monaco-editor';

interface ScriptEditorFieldProps {
  description: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function ScriptEditorField({
  label,
  description,
  value,
  onChange,
}: ScriptEditorFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">{label}</span>
      <span className="text-muted-fg text-xs">{description}</span>
      <div className="overflow-hidden rounded-md border">
        <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
          <MonacoEditor
            height="100px"
            language="javascript"
            onChange={(nextValue) => onChange(nextValue ?? '')}
            value={value}
          />
        </Suspense>
      </div>
    </div>
  );
}

interface AdvancedScriptsSectionProps {
  onSetupAChange: (value: string) => void;
  onSetupBChange: (value: string) => void;
  onTeardownAChange: (value: string) => void;
  onTeardownBChange: (value: string) => void;
  onToggle: () => void;
  setupA: string;
  setupB: string;
  showAdvanced: boolean;
  teardownA: string;
  teardownB: string;
}

export function AdvancedScriptsSection({
  showAdvanced,
  setupA,
  setupB,
  teardownA,
  teardownB,
  onToggle,
  onSetupAChange,
  onSetupBChange,
  onTeardownAChange,
  onTeardownBChange,
}: AdvancedScriptsSectionProps) {
  return (
    <div className="mt-2">
      <button
        className="flex items-center gap-2 text-muted-fg text-sm hover:text-fg"
        onClick={onToggle}
        type="button"
      >
        <span
          className={`inline-block transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
        >
          &#9654;
        </span>
        {showAdvanced ? 'Hide' : 'Show'} Advanced (Setup / Teardown)
      </button>

      {showAdvanced ? (
        <div className="mt-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScriptEditorField
              description="Runs once before iterations (not timed)"
              label="Setup A (optional)"
              onChange={onSetupAChange}
              value={setupA}
            />
            <ScriptEditorField
              description="Runs once before iterations (not timed)"
              label="Setup B (optional)"
              onChange={onSetupBChange}
              value={setupB}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ScriptEditorField
              description="Runs once after iterations (not timed)"
              label="Teardown A (optional)"
              onChange={onTeardownAChange}
              value={teardownA}
            />
            <ScriptEditorField
              description="Runs once after iterations (not timed)"
              label="Teardown B (optional)"
              onChange={onTeardownBChange}
              value={teardownB}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
