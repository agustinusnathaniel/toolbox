'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { JwtEncodeResult } from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';
import {
  encodeJwt,
  type JwtEncoderExample,
} from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';
import type { JwtEncoderState } from '@/lib/tools/jwt-encoder/adapters/jwt-encoder-params';
import {
  buildJwtEncoderParams,
  buildJwtEncoderStateFromSearch,
} from '@/lib/tools/jwt-encoder/adapters/jwt-encoder-params';

export function useJwtEncoderPage(
  search: Parameters<typeof buildJwtEncoderStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  const [state, setState] = useState(() =>
    buildJwtEncoderStateFromSearch(search)
  );
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<JwtEncodeResult | null>(null);
  const [computing, setComputing] = useState(false);
  const { copiedKey, copy } = useCopyFeedback<'token'>();

  const signToken = useCallback(async () => {
    setComputing(true);
    try {
      setResult(await encodeJwt({ ...state, secret }));
      trackAction('sign');
    } finally {
      setComputing(false);
    }
  }, [secret, state, trackAction]);

  const patchState = useCallback((patch: Partial<JwtEncoderState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    setResult(null);
  }, []);

  const updateSecret = useCallback((value: string) => {
    setSecret(value);
    setResult(null);
  }, []);

  const loadExample = (example: JwtEncoderExample) => {
    patchState({
      alg: example.alg,
      header: example.header,
      payload: example.payload,
    });
    setSecret(example.secret);
    trackAction('example');
  };

  const handleCopy = useCallback(async () => {
    if (result?.token && (await copy(result.token, 'token', 'Copied token'))) {
      trackAction('copy');
    }
  }, [copy, result, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildJwtEncoderParams(state),
    trackAction
  );

  return {
    computing,
    copiedKey,
    handleCopy,
    handleCopyLink,
    loadExample,
    result,
    secret,
    setSecret: updateSecret,
    signToken,
    state,
    updateAlg: (alg: JwtEncoderState['alg']) => patchState({ alg }),
    updateHeader: (header: string) => patchState({ header }),
    updatePayload: (payload: string) => patchState({ payload }),
  };
}
