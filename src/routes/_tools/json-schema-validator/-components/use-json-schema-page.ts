'use client';

import { useCallback, useEffect, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildJsonSchemaParams,
  buildJsonSchemaStateFromSearch,
  type JsonSchemaValidatorState,
} from '@/lib/tools/json-schema-validator/adapters/json-schema-params';
import type { SchemaValidationResult } from '@/lib/tools/json-schema-validator/adapters/json-schema-validator';

import { useJsonSchemaValidator } from './use-json-schema-validator';

type ValidationResult = SchemaValidationResult & { timedOut?: boolean };

function summarizeResult(result: ValidationResult | null): string | null {
  if (!result || result.error) {
    return null;
  }
  if (result.isValid) {
    return 'Valid — document satisfies the schema';
  }
  return result.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join('\n');
}

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

  const patchState = useCallback(
    (patch: Partial<JsonSchemaValidatorState>) => {
      setState((prev) => ({ ...prev, ...patch }));
      setResult(null);
    },
    [setResult]
  );

  const updateSchema = (schema: string) => patchState({ schema });

  const updateDocument = (document: string) => patchState({ document });

  const loadExample = (schema: string, document: string) => {
    patchState({ document, schema });
    trackAction('example');
  };

  const handleCopy = useCallback(async () => {
    const summary = summarizeResult(result);
    if (summary && (await copy(summary, 'copy', 'Copied validation result'))) {
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
    loadExample,
    result,
    runValidation,
    state,
    updateDocument,
    updateSchema,
  };
}
