'use client';

import { useCallback, useEffect, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildJsonSchemaParams,
  buildJsonSchemaStateFromSearch,
} from '@/lib/tools/json-schema-validator/adapters/json-schema-params';

import { useJsonSchemaValidator } from './use-json-schema-validator';

export function useJsonSchemaPage(
  search: Parameters<typeof buildJsonSchemaStateFromSearch>[0],
  trackAction: (a: string) => void,
  trackComplete: (v: boolean) => void
) {
  const [state, setState] = useState(() =>
    buildJsonSchemaStateFromSearch(search)
  );
  const { copiedKey, copy } = useCopyFeedback();
  const [trigger, setTrigger] = useState(0);
  const { computing, result, setResult } = useJsonSchemaValidator(
    state.schema,
    state.document,
    trigger
  );

  useEffect(() => {
    if (result && !result.timedOut && !result.error) {
      trackComplete(result.isValid);
    }
  }, [result, trackComplete]);

  const runValidation = useCallback(() => {
    setResult(null);
    setTrigger((t) => t + 1);
    trackAction('validate');
  }, [setResult, trackAction]);

  const updateSchema = useCallback(
    (schema: string) => {
      setState((prev) => ({ ...prev, schema }));
      setResult(null);
    },
    [setResult]
  );

  const updateDocument = useCallback(
    (document: string) => {
      setState((prev) => ({ ...prev, document }));
      setResult(null);
    },
    [setResult]
  );

  const handleCopy = useCallback(async () => {
    if (!result || result.error) {
      return;
    }
    const summary = result.isValid
      ? 'Valid — document satisfies the schema'
      : result.issues
          .map((issue) => `${issue.path}: ${issue.message}`)
          .join('\n');
    if (await copy(summary, 'copy', 'Copied validation result')) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJsonSchemaParams(state),
    trackAction
  );

  return {
    computing,
    copiedKey,
    handleCopy,
    handleCopyLink,
    result,
    runValidation,
    state,
    updateDocument,
    updateSchema,
  };
}
