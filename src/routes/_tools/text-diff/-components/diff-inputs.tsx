'use client';

import { LabeledTextarea } from '@/lib/components/labeled-textarea';

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
      <LabeledTextarea
        className="min-h-32"
        id="text-diff-original"
        label="Original"
        onChange={(e) => {
          setOriginal(e.target.value);
          setResult(null);
          setActiveAction(null);
        }}
        placeholder="Paste the original text here..."
        value={original}
      />
      <LabeledTextarea
        className="min-h-32"
        id="text-diff-modified"
        label="Modified"
        onChange={(e) => {
          setModified(e.target.value);
          setResult(null);
          setActiveAction(null);
        }}
        placeholder="Paste the modified text here..."
        value={modified}
      />
    </>
  );
}
