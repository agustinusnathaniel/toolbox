'use client';

import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';

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
    <Field>
      <FieldLabel htmlFor="hash-expected">Expected hash (optional)</FieldLabel>
      <Input
        className="font-mono"
        id="hash-expected"
        onChange={(e) => setExpected(e.target.value)}
        placeholder="Paste an expected hash to compare against"
        value={expected}
      />
    </Field>
  );
}
