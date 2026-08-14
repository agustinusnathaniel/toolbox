import {
  type FileContents,
  type FileDiffMetadata,
  parseDiffFromFile,
} from '@pierre/diffs';

export interface TextDiffResult {
  addedCount: number;
  error?: string;
  fileDiff: FileDiffMetadata | null;
  isValid: boolean;
  removedCount: number;
  timedOut?: boolean;
}

export const TEXT_DIFF_MAX_CHARS = 500_000;

export const TEXT_DIFF_FILENAME = 'text.txt';

/**
 * Builds the FileContents object used for both sides of the diff. A plain
 * `.txt` name keeps the renderer in plain-text mode (no code syntax
 * highlighting), matching the tool's text-first use case.
 */
export function toFileContents(contents: string): FileContents {
  return { contents, name: TEXT_DIFF_FILENAME };
}

export function diffTexts(original: string, modified: string): TextDiffResult {
  if (
    original.length > TEXT_DIFF_MAX_CHARS ||
    modified.length > TEXT_DIFF_MAX_CHARS
  ) {
    return {
      addedCount: 0,
      error: `Each input is limited to ${TEXT_DIFF_MAX_CHARS.toLocaleString()} characters.`,
      fileDiff: null,
      isValid: false,
      removedCount: 0,
    };
  }

  const fileDiff = parseDiffFromFile(
    toFileContents(original),
    toFileContents(modified)
  );

  let addedCount = 0;
  let removedCount = 0;
  for (const hunk of fileDiff.hunks) {
    for (const content of hunk.hunkContent) {
      if (content.type !== 'change') {
        continue;
      }
      addedCount += content.additions;
      removedCount += content.deletions;
    }
  }

  return {
    addedCount,
    fileDiff,
    isValid: true,
    removedCount,
  };
}

/**
 * Builds the copyable +/- diff text from a parsed diff. Only changed lines are
 * included; unchanged context lines are skipped. Lines are emitted in the
 * order they appear in the diff: deletions first, then additions, per change
 * block.
 */
const TRAILING_NEWLINE = /\n$/;

export function buildCopyDiffText(fileDiff: FileDiffMetadata): string {
  const lines: Array<string> = [];
  for (const hunk of fileDiff.hunks) {
    for (const content of hunk.hunkContent) {
      if (content.type !== 'change') {
        continue;
      }
      for (const line of fileDiff.deletionLines.slice(
        content.deletionLineIndex,
        content.deletionLineIndex + content.deletions
      )) {
        lines.push(`-${trimLineEnding(line)}`);
      }
      for (const line of fileDiff.additionLines.slice(
        content.additionLineIndex,
        content.additionLineIndex + content.additions
      )) {
        lines.push(`+${trimLineEnding(line)}`);
      }
    }
  }
  return lines.join('\n');
}

function trimLineEnding(line: string): string {
  return line.replace(TRAILING_NEWLINE, '');
}
