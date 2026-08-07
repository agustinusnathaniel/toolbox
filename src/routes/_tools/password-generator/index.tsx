'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy, KeyRound } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import type { PasswordResult } from '@/lib/tools/password-generator/adapters/password-generator';
import {
  estimateEntropy,
  generatePassword,
  strengthLabel,
} from '@/lib/tools/password-generator/adapters/password-generator';
import { copyToClipboard } from '@/lib/utils/clipboard';

import { meta } from './-meta';

export const Route = createFileRoute('/_tools/password-generator/')({
  component: PasswordGeneratorPage,
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

function PasswordGeneratorPage() {
  const { trackAction } = useToolTracking(
    'password-generator',
    'Password Generator'
  );
  const [length, setLength] = useState(20);
  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const [copied, setCopied] = useState(false);

  const options = useMemo(
    () => ({ digits, excludeAmbiguous, length, lowercase, symbols, uppercase }),
    [digits, excludeAmbiguous, length, lowercase, symbols, uppercase]
  );

  const handleGenerate = useCallback(() => {
    setResult(generatePassword(options));
    setCopied(false);
    trackAction('generate');
  }, [options, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    await copyToClipboard(result.output, 'Copied password');
    setCopied(true);
    trackAction('copy');
    setTimeout(() => setCopied(false), 1500);
  }, [result, trackAction]);

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
                onChange={(v) => setLength(v ?? 20)}
                value={length}
              >
                <NumberInput id="password-length" />
              </NumberField>
            </div>
            <Button onPress={handleGenerate} size="sm">
              <KeyRound className="size-4" />
              Generate
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Checkbox isSelected={lowercase} onChange={setLowercase}>
              Lowercase (a-z)
            </Checkbox>
            <Checkbox isSelected={uppercase} onChange={setUppercase}>
              Uppercase (A-Z)
            </Checkbox>
            <Checkbox isSelected={digits} onChange={setDigits}>
              Digits (0-9)
            </Checkbox>
            <Checkbox isSelected={symbols} onChange={setSymbols}>
              Symbols (!@#...)
            </Checkbox>
          </div>

          <Checkbox
            isSelected={excludeAmbiguous}
            onChange={setExcludeAmbiguous}
          >
            Exclude ambiguous characters (I, l, 1, O, 0, o)
          </Checkbox>

          {result && !result.isValid && (
            <p className="text-danger text-sm" role="alert">
              {result.error}
            </p>
          )}

          {result?.isValid && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-fg text-sm">
                  {strength} · {entropy} bits
                </span>
                <Button
                  aria-label="Copy password"
                  intent="outline"
                  onPress={handleCopy}
                  size="sq-sm"
                >
                  {copied ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-(--card-bg)/50 p-3 font-mono text-sm">
                {result.output}
              </pre>
            </div>
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
