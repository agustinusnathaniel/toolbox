'use client';

import { useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildRegexParams } from '@/lib/tools/regex-tester/adapters/regex-params';
import { copyToClipboard } from '@/lib/utils/clipboard';

import { useRegexTester } from './use-regex-tester';

function useRegexTracking(
  pattern: string,
  flags: string,
  input: string,
  trackAction: (a: string) => void
) {
  const previousInput = useRef<{
    flags: string;
    input: string;
    pattern: string;
  } | null>(null);
  useEffect(() => {
    const prev = previousInput.current;
    if (
      prev !== null &&
      (prev.pattern !== pattern || prev.flags !== flags || prev.input !== input)
    ) {
      trackAction('test');
    }
    previousInput.current = { flags, input, pattern };
  }, [flags, input, pattern, trackAction]);
}

function useRegexSegments(
  input: string,
  matches: Array<{ full: string; index: number }>
) {
  return useMemo(() => {
    const segs: Array<{ matched: boolean; start: number; text: string }> = [];
    let cursor = 0;
    for (const match of matches) {
      if (match.full.length === 0) {
        continue;
      }
      if (match.index > cursor) {
        segs.push({
          matched: false,
          start: cursor,
          text: input.slice(cursor, match.index),
        });
      }
      segs.push({ matched: true, start: match.index, text: match.full });
      cursor = match.index + match.full.length;
    }
    if (cursor < input.length) {
      segs.push({ matched: false, start: cursor, text: input.slice(cursor) });
    }
    return segs;
  }, [input, matches]);
}

function useRegexCopyActions(
  result: ReturnType<typeof useRegexTester>['result'],
  trackAction: (a: string) => void,
  setCopiedMatches: (v: boolean) => void
) {
  const handleCopyMatches = useCallback(async () => {
    if (result.matches.length === 0) {
      return;
    }
    const text = result.matches.map((m) => m.full).join('\n');
    if (await copyToClipboard(text, 'Copied Matches')) {
      setCopiedMatches(true);
      trackAction('copy');
      setTimeout(() => setCopiedMatches(false), 1500);
    }
  }, [result.matches, trackAction, setCopiedMatches]);
  return { handleCopyMatches };
}

export function useRegexPageState() {
  const { trackAction } = useToolTracking('regex-tester', 'Regex Tester');
  const search = useSearch({ from: '/_tools/regex-tester/' });
  const [pattern, setPattern] = useState(search.pattern ?? '');
  const [flags, setFlags] = useState(search.flags ?? '');
  const [input, setInput] = useState(search.input ?? '');
  const [copiedMatches, setCopiedMatches] = useState(false);
  const { result } = useRegexTester(pattern, flags, input);
  useRegexTracking(pattern, flags, input, trackAction);
  const segments = useRegexSegments(input, result.matches);
  const { handleCopyMatches } = useRegexCopyActions(
    result,
    trackAction,
    setCopiedMatches
  );
  const handleCopyLink = useCopyShareableLink(
    () => buildRegexParams(pattern, flags, input),
    trackAction,
    'share'
  );
  const matchLabel =
    result.matchCount === 1 ? '1 match' : `${result.matchCount} matches`;

  return {
    copiedMatches,
    flags,
    handleCopyLink,
    handleCopyMatches,
    input,
    matchLabel,
    pattern,
    result,
    segments,
    setFlags,
    setInput,
    setPattern,
    trackAction,
  };
}
