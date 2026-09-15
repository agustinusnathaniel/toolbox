'use client';

import { useCallback, useState } from 'react';

import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type {
  JwtDecodeResult,
  JwtVerifyResult,
} from '@/lib/tools/jwt-decoder/adapters/jwt-decoder';
import {
  decodeJwt,
  verifyJwtSignature,
} from '@/lib/tools/jwt-decoder/adapters/jwt-decoder';
import { buildJwtParams } from '@/lib/tools/jwt-decoder/adapters/jwt-params';

export function useJwtPage(
  initialToken: string,
  trackAction: (a: string) => void
) {
  const [token, setToken] = useState(initialToken);
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<JwtDecodeResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<JwtVerifyResult | null>(
    null
  );
  const { copiedKey, copy } = useCopyFeedback<'header' | 'payload'>();

  const handleDecode = useCallback(() => {
    setResult(decodeJwt(token));
    setVerifyResult(null);
    trackAction('decode');
  }, [token, trackAction]);

  const handleVerify = useCallback(async () => {
    setVerifyResult(await verifyJwtSignature(token, secret));
    trackAction('verify');
  }, [secret, token, trackAction]);

  const handleCopy = useCallback(
    async (field: 'header' | 'payload', text: string) => {
      if (await copy(text, field, 'Copied')) {
        trackAction('copy');
      }
    },
    [copy, trackAction]
  );

  const handleCopyLink = useCopyShareableLink(
    () => buildJwtParams(token),
    trackAction
  );

  const clearResults = useCallback(() => {
    setResult(null);
    setVerifyResult(null);
  }, []);

  return {
    clearResults,
    copiedKey,
    handleCopy,
    handleCopyLink,
    handleDecode,
    handleVerify,
    result,
    secret,
    setSecret,
    setToken,
    token,
    verifyResult,
  };
}
