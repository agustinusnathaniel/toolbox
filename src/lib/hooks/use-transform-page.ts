'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { TransformResult } from '@/lib/utils/transform';

type WorkerPageResult = TransformResult & { timedOut?: boolean };

interface TransformPageConfig<TSearch, TMode extends string> {
  buildParams: (state: { input: string; mode: TMode }) => URLSearchParams;
  buildStateFromSearch: (search: TSearch) => {
    input: string;
    mode: TMode;
  };
  /** Worker-backed conversion hook taking (input, mode, trigger). */
  useConverter: (
    input: string,
    mode: TMode,
    trigger: number
  ) => {
    computing: boolean;
    result: WorkerPageResult | null;
    setResult: Dispatch<SetStateAction<WorkerPageResult | null>>;
  };
}

/**
 * Shared page-hook skeleton for the worker-backed string-transform tools
 * (csv-converter, yaml-converter): state from search params, convert
 * trigger, copy/copy-link/clear handlers, and mode/input change handling.
 */
export function useTransformPage<TSearch, TMode extends string>(
  search: TSearch,
  trackAction: (a: string) => void,
  config: TransformPageConfig<TSearch, TMode>
) {
  const [state, setState] = useState(() => config.buildStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = config.useConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: TMode) => {
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

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    setResult(null);
    setConvertTrigger(0);
    trackAction('clear');
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
    () => config.buildParams(state),
    trackAction
  );

  return {
    computing,
    copiedKey,
    handleClear,
    handleConvert,
    handleCopy,
    handleCopyLink,
    handleInputChange,
    handleModeChange,
    result,
    state,
  };
}
