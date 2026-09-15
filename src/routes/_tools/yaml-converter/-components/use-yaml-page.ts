'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';
import {
  buildYamlParams,
  buildYamlStateFromSearch,
} from '@/lib/tools/yaml-converter/adapters/yaml-params';

import { useYamlConverter } from './use-yaml-converter';

export function useYamlPage(
  search: Parameters<typeof buildYamlStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  const [state, setState] = useState(() => buildYamlStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useYamlConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: YamlMode) => {
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
    setConvertTrigger((t) => t + 1);
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
    () => buildYamlParams(state.input, state.mode),
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
