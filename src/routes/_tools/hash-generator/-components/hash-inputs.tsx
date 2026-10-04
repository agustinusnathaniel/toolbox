'use client';

import { LabeledTextarea } from '@/lib/components/labeled-textarea';

export function HashTextInput({
  text,
  setText,
  setResult,
  setFileName,
}: {
  text: string;
  setText: (v: string) => void;
  setResult: (v: null) => void;
  setFileName: (v: null) => void;
}) {
  return (
    <LabeledTextarea
      id="hash-text"
      label="Text"
      onChange={(e) => {
        setText(e.target.value);
        setResult(null);
        setFileName(null);
      }}
      placeholder="Type or paste text to hash..."
      value={text}
    />
  );
}

export function HashExpectedInput({
  expected,
  setExpected,
}: {
  expected: string;
  setExpected: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="hash-expected">
        Expected hash (optional)
      </label>
      <input
        className="w-full rounded-lg border bg-bg px-3 py-2 font-mono text-sm outline-hidden focus:ring-2 focus:ring-primary/30"
        id="hash-expected"
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Paste an expected hash to compare against"
        value={expected}
      />
    </div>
  );
}
