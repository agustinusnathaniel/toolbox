'use client';

import { ScanLine, ShieldCheck } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';

export function JwtTokenInput({
  onChange,
  token,
}: {
  onChange: (v: string) => void;
  token: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="jwt-token">
        Token
      </label>
      <textarea
        className="field-sizing-content min-h-40 w-full rounded-lg border border-input bg-transparent p-3 font-mono text-fg text-sm outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20"
        id="jwt-token"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a JWT to decode..."
        value={token}
      />
    </div>
  );
}

export function JwtDecodeActions({
  onCopyLink,
  onDecode,
}: {
  onCopyLink: () => void;
  onDecode: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onPress={onDecode} size="sm">
        <ScanLine className="size-4" />
        Decode
      </Button>
      <CopyLinkButton label="Copy shareable link" onPress={onCopyLink} />
    </div>
  );
}

export function JwtSecretInput({
  onChange,
  secret,
}: {
  onChange: (v: string) => void;
  secret: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-muted-fg text-sm" htmlFor="jwt-secret">
        Shared secret (optional)
      </label>
      <input
        className="w-full rounded-lg border bg-bg px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-primary/30"
        id="jwt-secret"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a secret to verify the HMAC signature"
        type="password"
        value={secret}
      />
    </div>
  );
}

export function JwtVerifyBar({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onPress={onVerify} size="sm">
        <ShieldCheck className="size-4" />
        Verify signature
      </Button>
    </div>
  );
}

export function JwtStatus({
  error,
  isValid,
  message,
}: {
  error?: string;
  isValid: boolean;
  message?: string;
}) {
  return (
    <>
      {message && (
        <p
          className={isValid ? 'text-sm text-success' : 'text-danger text-sm'}
          role="status"
        >
          {message}
        </p>
      )}
      {!isValid && error && (
        <ToolError message={error} title="Unable to decode" />
      )}
    </>
  );
}

export function JwtClaims({
  claims,
  copiedKey,
  header,
  headerRaw,
  onCopy,
  payload,
  payloadRaw,
}: {
  claims: Array<{ key: string; value: string }>;
  copiedKey: string | null;
  header: unknown;
  headerRaw: string;
  onCopy: (f: 'header' | 'payload', t: string) => void;
  payload: unknown;
  payloadRaw: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ResultPanel
        copied={copiedKey === 'header'}
        copyLabel="Copy header"
        label="Header"
        onCopy={() => onCopy('header', headerRaw)}
        value={JSON.stringify(header, null, 2)}
      />
      <ResultPanel
        copied={copiedKey === 'payload'}
        copyLabel="Copy payload"
        label="Payload"
        onCopy={() => onCopy('payload', payloadRaw)}
        value={JSON.stringify(payload, null, 2)}
      />
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--card-bg)/50 text-muted-fg">
            <tr>
              <th className="p-3 font-medium">Claim</th>
              <th className="p-3 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr className="border-input border-t" key={claim.key}>
                <td className="break-words p-3 font-mono">{claim.key}</td>
                <td className="break-words p-3 font-mono">{claim.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function JwtHelp() {
  return (
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
  );
}
