'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { SqlDialect } from '@/lib/tools/sql-formatter/adapters/sql-formatter';
import type { SqlSearchAction } from '@/lib/tools/sql-formatter/adapters/sql-params';
import {
  buildSqlParams,
  buildSqlStateFromSearch,
} from '@/lib/tools/sql-formatter/adapters/sql-params';

import { useSqlFormatter } from './use-sql-formatter';

function useSqlEdits(
  setState: React.Dispatch<
    React.SetStateAction<{
      action: SqlSearchAction;
      dialect: SqlDialect;
      input: string;
    }>
  >,
  setResult: (v: null) => void
) {
  const handleDialectChange = useCallback(
    (dialect: SqlDialect) => {
      setState((prev) => ({ ...prev, dialect }));
      setResult(null);
    },
    [setResult, setState]
  );
  const handleActionChange = useCallback(
    (action: SqlSearchAction) => {
      setState((prev) => ({ ...prev, action }));
      setResult(null);
    },
    [setResult, setState]
  );
  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult, setState]
  );
  return { handleActionChange, handleDialectChange, handleInputChange };
}

function useSqlCopy(
  state: { action: SqlSearchAction; dialect: SqlDialect; input: string },
  result: { formatted?: string; isValid: boolean } | null,
  copy: (v: string, k: string, l: string) => Promise<boolean>,
  trackAction: (a: string) => void
) {
  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.formatted)) {
      return;
    }
    if (await copy(result.formatted, 'copy', 'Copied SQL')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);
  const handleCopyLink = useCopyShareableLink(
    () => buildSqlParams(state.input, state.dialect, state.action),
    trackAction
  );
  return { handleCopy, handleCopyLink };
}

export function useSqlPage(
  search: Parameters<typeof buildSqlStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  const [state, setState] = useState(() => buildSqlStateFromSearch(search));
  const [formatTrigger, setFormatTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();
  const { computing, result, setResult } = useSqlFormatter(
    state.input,
    state.dialect,
    state.action,
    formatTrigger
  );

  const { handleActionChange, handleDialectChange, handleInputChange } =
    useSqlEdits(setState, setResult);

  const handleFormat = useCallback(() => {
    setResult(null);
    setFormatTrigger((t) => t + 1);
    trackAction(state.action);
  }, [setResult, state.action, trackAction]);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    setResult(null);
    setFormatTrigger(0);
    trackAction('clear');
  }, [setResult, trackAction]);

  const { handleCopy, handleCopyLink } = useSqlCopy(
    state,
    result,
    copy,
    trackAction
  );

  return {
    computing,
    copiedKey,
    handleActionChange,
    handleClear,
    handleCopy,
    handleCopyLink,
    handleDialectChange,
    handleFormat,
    handleInputChange,
    result,
    state,
  };
}
