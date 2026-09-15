'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { CsvMode } from '@/lib/tools/csv-converter/adapters/csv-converter';
import {
  buildCsvParams,
  buildCsvStateFromSearch,
} from '@/lib/tools/csv-converter/adapters/csv-params';

import { useCsvConverter } from './use-csv-converter';

export function useCsvPage(
  search: Parameters<typeof buildCsvStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  const [state, setState] = useState(() => buildCsvStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useCsvConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: CsvMode) => {
      setState((prev) => ({ ...prev, mode }));
      setResult(null);
    },
    [setResult]
  );

  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult]
  );

  const handleConvert = useCallback(() => {
    setResult(null);
    setConvertTrigger((trigger) => trigger + 1);
    trackAction('convert');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied Output')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildCsvParams(state),
    trackAction
  );

  return {
    computing,
    copiedKey,
    handleConvert,
    handleCopy,
    handleCopyLink,
    handleInputChange,
    handleModeChange,
    result,
    state,
  };
}
