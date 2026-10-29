'use client';

import { PenLine } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolError } from '@/lib/components/tool-error';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import type {
  JwtEncodeResult,
  JwtEncoderAlg,
  JwtEncoderExample,
} from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';
import { JWT_ENCODER_ALGS } from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';

export function JwtEncoderInputs({
  alg,
  header,
  onAlg,
  onHeader,
  onPayload,
  payload,
}: {
  alg: JwtEncoderAlg;
  header: string;
  onAlg: (v: JwtEncoderAlg) => void;
  onHeader: (v: string) => void;
  onPayload: (v: string) => void;
  payload: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="jwt-encoder-alg">Algorithm</FieldLabel>
        <Select
          onValueChange={(value: string | null) => {
            if (value) {
              onAlg(value as JwtEncoderAlg);
            }
          }}
          value={alg}
        >
          <SelectTrigger aria-label="Signing algorithm" id="jwt-encoder-alg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JWT_ENCODER_ALGS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <LabeledTextarea
          id="jwt-encoder-header"
          label="Header"
          onChange={(e) => onHeader(e.target.value)}
          placeholder='e.g. {"alg":"HS256","typ":"JWT"}'
          spellCheck={false}
          value={header}
        />
        <LabeledTextarea
          id="jwt-encoder-payload"
          label="Payload"
          onChange={(e) => onPayload(e.target.value)}
          placeholder='e.g. {"sub":"1234567890","name":"Ada"}'
          spellCheck={false}
          value={payload}
        />
      </div>
    </div>
  );
}

export function JwtEncoderSecret({
  onChange,
  secret,
}: {
  onChange: (v: string) => void;
  secret: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="jwt-encoder-secret">
        Secret (never added to the share link)
      </FieldLabel>
      <Input
        id="jwt-encoder-secret"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter the HMAC secret to sign with"
        type="password"
        value={secret}
      />
    </Field>
  );
}

export function JwtEncoderActions({
  computing,
  onCopyLink,
  onSign,
}: {
  computing: boolean;
  onCopyLink: () => void;
  onSign: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={computing} onClick={onSign} size="sm">
        <PenLine aria-hidden="true" className="size-4" />
        Sign token
      </Button>
      {computing && (
        <span aria-live="polite" className="text-muted-foreground text-xs">
          Signing…
        </span>
      )}
      <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
    </div>
  );
}

export function JwtEncoderExamples({
  examples,
  onSelect,
}: {
  examples: ReadonlyArray<JwtEncoderExample>;
  onSelect: (example: JwtEncoderExample) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Try:</span>
      {examples.map((example) => (
        <Button
          aria-label={`Load ${example.label} example`}
          key={example.label}
          onClick={() => onSelect(example)}
          size="xs"
          variant="outline"
        >
          {example.label}
        </Button>
      ))}
    </div>
  );
}

export function JwtEncoderOutput({
  copied,
  hasInput,
  onCopy,
  result,
}: {
  copied: boolean;
  hasInput: boolean;
  onCopy: () => void;
  result: JwtEncodeResult | null;
}) {
  if (!hasInput) {
    return (
      <p className="text-muted-foreground text-xs">
        Paste a header and a payload, enter the secret, then click Sign token.
      </p>
    );
  }
  if (!result) {
    return null;
  }
  if (!result.isValid) {
    return <ToolError message={result.error} title="Cannot sign" />;
  }
  if (!result.token) {
    return null;
  }
  return (
    <ResultPanel
      copied={copied}
      copyLabel="Copy token"
      label="Signed token"
      onCopy={onCopy}
      value={result.token}
    />
  );
}

export function JwtEncoderHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'HS256, HS384, and HS512 — the HMAC family, signed with a shared secret. Asymmetric algorithms (RS256, ES256, …) need a private key file, so they are out of scope for this tool.',
          question: 'Which algorithms are supported?',
        },
        {
          answer:
            'Yes. Sharing a link with the secret inside would leak signing power to anyone holding the link, so the secret field is always excluded — only the algorithm, header, and payload travel in the URL.',
          question: 'Why is the secret missing from the share link?',
        },
        {
          answer:
            'Paste the token into the JWT Decoder tool to inspect its claims, or verify the HMAC signature there with the same secret.',
          question: 'How do I check a token this tool made?',
        },
        {
          answer:
            'Yes. Signing runs locally in your browser via the WebCrypto-backed jose library — header, payload, and secret never leave your device.',
          question: 'Is my data safe?',
        },
      ]}
      howItWorks={{
        description:
          'Write the header and payload as JSON, pick the algorithm, and sign with your secret.',
        steps: [
          'Pick the HMAC algorithm',
          'Paste the header and payload JSON',
          'Enter the shared secret (kept out of share links)',
          'Click Sign token, then copy the token or share a link to the inputs',
        ],
      }}
    />
  );
}
