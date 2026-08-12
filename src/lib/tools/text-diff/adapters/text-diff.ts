import type { Change } from 'diff';
import { diffLines, diffWordsWithSpace } from 'diff';

export interface TextDiffWordChunk {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface TextDiffLine {
  chunks?: Array<TextDiffWordChunk>;
  content: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface TextDiffResult {
  addedCount: number;
  error?: string;
  isValid: boolean;
  lines: Array<TextDiffLine>;
  removedCount: number;
  timedOut?: boolean;
  truncated?: boolean;
}

export const TEXT_DIFF_MAX_CHARS = 500_000;

/** Maximum lines stored/rendered. Counts still reported via addedCount/removedCount. */
export const MAX_DIFF_LINES = 20_000;

export function diffTexts(original: string, modified: string): TextDiffResult {
  if (
    original.length > TEXT_DIFF_MAX_CHARS ||
    modified.length > TEXT_DIFF_MAX_CHARS
  ) {
    return {
      addedCount: 0,
      error: `Each input is limited to ${TEXT_DIFF_MAX_CHARS.toLocaleString()} characters.`,
      isValid: false,
      lines: [],
      removedCount: 0,
    };
  }

  const parts = diffLines(original, modified);
  const lines: Array<TextDiffLine> = [];
  let addedCount = 0;
  let removedCount = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.added) {
      addedCount += pushSplitLines(lines, 'added', part.value);
      continue;
    }
    if (!part.removed) {
      pushSplitLines(lines, 'unchanged', part.value);
      continue;
    }
    const next = parts[i + 1];
    if (!next?.added) {
      removedCount += pushSplitLines(lines, 'removed', part.value);
      continue;
    }
    i++; // consume the paired added part
    const paired = linesWithChunks(part.value, next.value);
    if (paired === null) {
      removedCount += pushSplitLines(lines, 'removed', part.value);
      addedCount += pushSplitLines(lines, 'added', next.value);
      continue;
    }
    for (const line of paired.removed) {
      lines.push({ type: 'removed', ...line });
      removedCount++;
    }
    for (const line of paired.added) {
      lines.push({ type: 'added', ...line });
      addedCount++;
    }
  }

  const truncated = lines.length > MAX_DIFF_LINES;
  if (truncated) {
    lines.length = MAX_DIFF_LINES;
  }

  return {
    addedCount,
    isValid: true,
    lines,
    removedCount,
    ...(truncated ? { truncated: true } : {}),
  };
}

function pushSplitLines(
  lines: Array<TextDiffLine>,
  type: TextDiffLine['type'],
  value: string
): number {
  const contents = splitLines(value);
  for (const content of contents) {
    lines.push({ content, type });
  }
  return contents.length;
}

function linesWithChunks(
  removedValue: string,
  addedValue: string
): {
  added: Array<{ chunks: Array<TextDiffWordChunk>; content: string }>;
  removed: Array<{ chunks: Array<TextDiffWordChunk>; content: string }>;
} | null {
  const wordParts = diffWordsWithSpace(removedValue, addedValue);
  const removedStream = wordParts.filter((part) => !part.added);
  const addedStream = wordParts.filter((part) => !part.removed);
  const removedLines = splitChunksByLine(removedStream);
  const addedLines = splitChunksByLine(addedStream);
  if (removedLines.length !== addedLines.length || removedLines.length === 0) {
    return null; // fall back to line-level diff (no inline chunks)
  }
  return {
    added: addedLines.map((chunks) => ({
      chunks,
      content: chunks.map((c) => c.text).join(''),
    })),
    removed: removedLines.map((chunks) => ({
      chunks,
      content: chunks.map((c) => c.text).join(''),
    })),
  };
}

function splitChunksByLine(
  parts: Array<Change>
): Array<Array<TextDiffWordChunk>> {
  const lines: Array<Array<TextDiffWordChunk>> = [];
  let current: Array<TextDiffWordChunk> = [];
  for (const part of parts) {
    let type: TextDiffWordChunk['type'];
    if (part.added) {
      type = 'added';
    } else if (part.removed) {
      type = 'removed';
    } else {
      type = 'unchanged';
    }
    const segments = part.value.split('\n');
    for (let i = 0; i < segments.length; i++) {
      if (i > 0) {
        lines.push(current);
        current = [];
      }
      const segment = segments[i];
      if (segment.length > 0) {
        current.push({ text: segment, type });
      }
    }
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines;
}

function splitLines(value: string): Array<string> {
  const lines = value.split('\n');
  if (lines.at(-1) === '') {
    lines.pop();
  }
  return lines;
}
