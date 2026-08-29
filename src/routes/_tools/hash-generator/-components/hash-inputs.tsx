'use client';

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
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="hash-text">
        Text
      </label>
      <textarea
        className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
        id="hash-text"
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
          setFileName(null);
        }}
        placeholder="Type or paste text to hash..."
        value={text}
      />
    </div>
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
