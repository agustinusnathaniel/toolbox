'use client';

type DiffInputsProps = {
  original: string;
  modified: string;
  setOriginal: (v: string) => void;
  setModified: (v: string) => void;
  setResult: (v: null) => void;
  setActiveAction: (v: null) => void;
};

export function DiffInputs({
  original,
  modified,
  setOriginal,
  setModified,
  setResult,
  setActiveAction,
}: DiffInputsProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-muted-fg text-sm" htmlFor="text-diff-original">
          Original
        </label>
        <textarea
          className="field-sizing-content min-h-32 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
          id="text-diff-original"
          onChange={(e) => {
            setOriginal(e.target.value);
            setResult(null);
            setActiveAction(null);
          }}
          placeholder="Paste the original text here..."
          value={original}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-muted-fg text-sm" htmlFor="text-diff-modified">
          Modified
        </label>
        <textarea
          className="field-sizing-content min-h-32 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
          id="text-diff-modified"
          onChange={(e) => {
            setModified(e.target.value);
            setResult(null);
            setActiveAction(null);
          }}
          placeholder="Paste the modified text here..."
          value={modified}
        />
      </div>
    </>
  );
}
