'use client';

import { useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  HashAlgorithm,
  HashResult,
} from '@/lib/tools/hash-generator/adapters/hash-generator';
import {
  compareDigests,
  hashBytes,
  hashText,
} from '@/lib/tools/hash-generator/adapters/hash-generator';
import {
  buildHashParams,
  buildHashStateFromSearch,
} from '@/lib/tools/hash-generator/adapters/hash-params';

function useHashCore() {
  const search = useSearch({ from: '/_tools/hash-generator/' });
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(
    () => buildHashStateFromSearch(search).algorithm
  );
  const [text, setText] = useState(() => buildHashStateFromSearch(search).text);
  const [result, setResult] = useState<HashResult | null>(null);
  const [expected, setExpected] = useState(
    () => buildHashStateFromSearch(search).expected
  );
  const [fileName, setFileName] = useState<string | null>(null);
  return {
    algorithm,
    expected,
    fileName,
    result,
    setAlgorithm,
    setExpected,
    setFileName,
    setResult,
    setText,
    text,
  };
}

function useHashTextActions(
  core: ReturnType<typeof useHashCore>,
  trackAction: (a: string) => void
) {
  const { copiedKey, copy } = useCopyFeedback();
  const handleHashText = useCallback(async () => {
    const res = await hashText({ algorithm: core.algorithm, text: core.text });
    core.setResult(res);
    core.setFileName(null);
    trackAction('hash-text');
    if (res.isValid && core.expected.trim()) {
      trackAction(
        compareDigests(res.output, core.expected)
          ? 'verify-match'
          : 'verify-mismatch'
      );
    }
  }, [
    core.algorithm,
    core.text,
    core.expected,
    trackAction,
    core.setFileName,
    core.setResult,
  ]);
  const handleCopy = useCallback(async () => {
    if (!(core.result?.isValid && core.result.output)) {
      return;
    }
    if (await copy(core.result.output, 'copy', 'Copied hash')) {
      trackAction('copy');
    }
  }, [core.result, copy, trackAction]);
  const handleCopyLink = useCopyShareableLink(
    () => buildHashParams(core.text, core.algorithm, core.expected),
    trackAction
  );
  return { copiedKey, copy, handleCopy, handleCopyLink, handleHashText };
}

function useHashFileActions(
  core: ReturnType<typeof useHashCore>,
  trackAction: (a: string) => void
) {
  const handleFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      const res = await hashBytes(new Uint8Array(buffer), core.algorithm);
      core.setResult(res);
      core.setFileName(`${file.name} (${file.size} bytes)`);
      trackAction('hash-file');
      if (res.isValid && core.expected.trim()) {
        trackAction(
          compareDigests(res.output, core.expected)
            ? 'verify-match'
            : 'verify-mismatch'
        );
      }
    },
    [
      core.algorithm,
      core.expected,
      trackAction,
      core.setResult,
      core.setFileName,
    ]
  );
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile]
  );
  return { handleFile, handleFileSelect };
}

function useHashActions(
  core: ReturnType<typeof useHashCore>,
  trackAction: (a: string) => void
) {
  const textActions = useHashTextActions(core, trackAction);
  const fileActions = useHashFileActions(core, trackAction);
  return {
    copiedKey: textActions.copiedKey,
    handleCopy: textActions.handleCopy,
    handleCopyLink: textActions.handleCopyLink,
    handleFile: fileActions.handleFile,
    handleFileSelect: fileActions.handleFileSelect,
    handleHashText: textActions.handleHashText,
  };
}

export function useHashPage() {
  const { trackAction } = useToolTracking('hash-generator', 'Hash Generator');
  const core = useHashCore();
  const actions = useHashActions(core, trackAction);
  return { ...core, ...actions, trackAction };
}
