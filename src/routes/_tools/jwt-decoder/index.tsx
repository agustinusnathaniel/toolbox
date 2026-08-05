'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy, ScanLine, ShieldCheck } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import type {
  JwtDecodeResult,
  JwtVerifyResult,
} from '@/lib/tools/jwt-decoder/adapters/jwt-decoder';
import {
  decodeJwt,
  verifyJwtSignature,
} from '@/lib/tools/jwt-decoder/adapters/jwt-decoder';
import { copyToClipboard } from '@/lib/utils/clipboard';

const meta = {
  description:
    'Decode JSON Web Tokens (JWT) and verify HMAC signatures entirely in your browser. No token ever leaves your device.',
  pageTitle: 'JWT Decoder',
  slug: 'jwt-decoder',
} as const;

export const Route = createFileRoute('/_tools/jwt-decoder/')({
  component: JwtDecoderPage,
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
    ],
  }),
  staticData: {
    meta,
  },
});

function JwtDecoderPage() {
  const { trackAction } = useToolTracking('jwt-decoder', 'JWT Decoder');
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<JwtDecodeResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<JwtVerifyResult | null>(
    null
  );
  const [copiedField, setCopiedField] = useState<'header' | 'payload' | null>(
    null
  );

  const handleDecode = useCallback(() => {
    setResult(decodeJwt(token));
    setVerifyResult(null);
    setCopiedField(null);
    trackAction('decode');
  }, [token, trackAction]);

  const handleVerify = useCallback(async () => {
    setVerifyResult(await verifyJwtSignature(token, secret));
    trackAction('verify');
  }, [secret, token, trackAction]);

  const handleCopy = useCallback(
    async (field: 'header' | 'payload', text: string) => {
      await copyToClipboard(text, 'Copied');
      setCopiedField(field);
      trackAction('copy');
      setTimeout(() => setCopiedField(null), 1500);
    },
    [trackAction]
  );

  const showError = result && !result.isValid;
  const showResult = result?.isValid;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="jwt-token">
              Token
            </label>
            <textarea
              className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
              id="jwt-token"
              onChange={(e) => {
                setToken(e.target.value);
                setResult(null);
                setVerifyResult(null);
              }}
              placeholder="Paste a JWT to decode..."
              value={token}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleDecode} size="sm">
              <ScanLine className="size-4" />
              Decode
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="jwt-secret">
              Shared secret (optional)
            </label>
            <input
              className="w-full rounded-lg border bg-bg px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30"
              id="jwt-secret"
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter a secret to verify the HMAC signature"
              type="password"
              value={secret}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onPress={handleVerify} size="sm">
              <ShieldCheck className="size-4" />
              Verify signature
            </Button>
          </div>

          {verifyResult && (
            <p
              className={
                verifyResult.isValid
                  ? 'text-sm text-success'
                  : 'text-danger text-sm'
              }
              role="status"
            >
              {verifyResult.message}
            </p>
          )}

          {showError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/5 p-3"
              role="alert"
            >
              <p className="font-medium text-danger text-sm">
                Unable to decode
              </p>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-danger/80 text-xs">
                {result.error}
              </pre>
            </div>
          )}

          {showResult && result.isValid && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-fg text-sm">Header</span>
                  <Button
                    aria-label="Copy header"
                    intent="outline"
                    onPress={() => handleCopy('header', result.headerRaw)}
                    size="sq-sm"
                  >
                    {copiedField === 'header' ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-fg text-sm">Payload</span>
                  <Button
                    aria-label="Copy payload"
                    intent="outline"
                    onPress={() => handleCopy('payload', result.payloadRaw)}
                    size="sq-sm"
                  >
                    {copiedField === 'payload' ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-(--card-bg)/50 text-muted-fg">
                    <tr>
                      <th className="p-3 font-medium">Claim</th>
                      <th className="p-3 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.claims.map((claim) => (
                      <tr className="border-input border-t" key={claim.key}>
                        <td className="p-3 font-mono">{claim.key}</td>
                        <td className="p-3 font-mono">{claim.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'No. Decoding and signature verification happen entirely in your browser with the native Web Crypto API. Your JWT never leaves your device.',
            question: 'Is my token sent anywhere?',
          },
        ]}
        howItWorks={{
          description:
            'Paste a JWT to inspect its header and payload, then optionally verify the signature with a shared secret.',
          steps: [
            'Paste a JWT',
            'Decode to inspect header and payload claims',
            'Optionally enter a shared secret and verify the HMAC signature',
          ],
        }}
      />
    </div>
  );
}
