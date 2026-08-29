'use client';

import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';

export function RegexPatternInput({
  pattern,
  setPattern,
}: {
  pattern: string;
  setPattern: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="regex-pattern">
        Pattern
      </label>
      <Input
        aria-label="Regular expression pattern"
        className="font-mono"
        id="regex-pattern"
        onChange={(e) => setPattern(e.target.value)}
        placeholder="e.g. (\w+)@(\w+)"
        value={pattern}
      />
    </div>
  );
}

export function RegexFlagsInput({
  flags,
  setFlags,
}: {
  flags: string;
  setFlags: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="regex-flags">
        Flags
      </label>
      <Input
        aria-label="Regular expression flags"
        className="font-mono"
        id="regex-flags"
        onChange={(e) => setFlags(e.target.value)}
        placeholder="gimsuy"
        value={flags}
      />
      <p className="text-muted-fg text-xs">Valid flags: g i m s u y</p>
    </div>
  );
}

export function RegexTestInput({
  input,
  setInput,
}: {
  input: string;
  setInput: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="regex-input">
        Test text
      </label>
      <Textarea
        aria-label="Test text"
        className="min-h-40 font-mono"
        id="regex-input"
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste or type the text to test against..."
        value={input}
      />
    </div>
  );
}
