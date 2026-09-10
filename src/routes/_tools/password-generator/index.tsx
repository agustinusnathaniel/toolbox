'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { KeyRound } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Checkbox, CheckboxField } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { PasswordResult } from '@/lib/tools/password-generator/adapters/password-generator';
import {
  estimateEntropy,
  generatePassword,
  strengthLabel,
} from '@/lib/tools/password-generator/adapters/password-generator';
import {
  buildPasswordParams,
  buildPasswordStateFromSearch,
} from '@/lib/tools/password-generator/adapters/password-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  digits: z.string().optional(),
  excludeAmbiguous: z.string().optional(),
  length: z.string().optional(),
  lowercase: z.string().optional(),
  symbols: z.string().optional(),
  uppercase: z.string().optional(),
});

export const Route = createFileRoute('/_tools/password-generator/')({
  component: PasswordGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

const CHARACTER_SET_OPTIONS = [
  { key: 'lowercase', label: 'Lowercase (a-z)' },
  { key: 'uppercase', label: 'Uppercase (A-Z)' },
  { key: 'digits', label: 'Digits (0-9)' },
  { key: 'symbols', label: 'Symbols (!@#...)' },
] as const;

function PasswordGeneratorPage() {
  const { trackAction } = useToolTracking(
    'password-generator',
    'Password Generator'
  );
  const search = useSearch({ from: '/_tools/password-generator/' });
  const [options, setOptions] = useState(() =>
    buildPasswordStateFromSearch(search)
  );
  const [result, setResult] = useState<PasswordResult | null>(null);
  const { copiedKey, copy } = useCopyFeedback();

  const handleGenerate = useCallback(() => {
    setResult(generatePassword(options));
    trackAction('generate');
  }, [options, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied password')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildPasswordParams(options),
    trackAction
  );

  const entropy = useMemo(() => estimateEntropy(options), [options]);
  const strength = strengthLabel(entropy);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="password-length">Length</Label>
              <NumberField
                maxValue={128}
                minValue={8}
                onChange={(v) =>
                  setOptions((prev) => ({ ...prev, length: v ?? prev.length }))
                }
                value={options.length}
              >
                <NumberInput id="password-length" />
              </NumberField>
            </div>
            <Button onPress={handleGenerate} size="sm">
              <KeyRound className="size-4" />
              Generate
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyLinkButton
              label="Copy shareable link"
              onPress={handleCopyLink}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CHARACTER_SET_OPTIONS.map(({ key, label }) => (
              <CheckboxField
                isSelected={options[key]}
                key={key}
                onChange={(selected) =>
                  setOptions((prev) => ({ ...prev, [key]: selected }))
                }
              >
                <Checkbox>{label}</Checkbox>
              </CheckboxField>
            ))}
          </div>

          <CheckboxField
            isSelected={options.excludeAmbiguous}
            onChange={(selected) =>
              setOptions((prev) => ({ ...prev, excludeAmbiguous: selected }))
            }
          >
            <Checkbox>Exclude ambiguous characters (I, l, 1, O, 0, o)</Checkbox>
          </CheckboxField>

          {result && !result.isValid && (
            <p className="text-danger text-sm" role="alert">
              {result.error}
            </p>
          )}

          {result?.isValid && (
            <ResultPanel
              copied={copiedKey === 'copy'}
              copyLabel="Copy password"
              label={`${strength} · ${entropy} bits`}
              onCopy={handleCopy}
              value={result.output}
            />
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. Passwords are generated with the Web Crypto API (crypto.getRandomValues) entirely in your browser. Nothing is ever sent to a server.',
            question: 'Is my password sent anywhere?',
          },
          {
            answer:
              'Entropy estimates how hard the password is to guess, measured in bits. Higher is stronger: 70+ bits is considered strong for most uses.',
            question: 'What does the strength score mean?',
          },
        ]}
        howItWorks={{
          description:
            'Pick a length and the character sets to include, then click Generate. The password is created locally with cryptographically secure randomness.',
          steps: [
            'Set the password length (8-128 characters)',
            'Choose which character sets to include',
            'Optionally exclude ambiguous characters like I, l, 1, O, 0',
            'Click Generate, then copy the password',
          ],
        }}
      />
    </div>
  );
}
