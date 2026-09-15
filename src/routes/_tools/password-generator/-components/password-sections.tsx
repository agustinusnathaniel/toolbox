'use client';

import { KeyRound } from 'lucide-react';

import { ResultPanel } from '@/lib/components/result-panel';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Checkbox, CheckboxField } from '@/lib/components/ui/checkbox';
import { Label } from '@/lib/components/ui/field';
import { NumberField, NumberInput } from '@/lib/components/ui/number-field';
import { strengthLabel } from '@/lib/tools/password-generator/adapters/password-generator';

const CHARACTER_SET_OPTIONS = [
  { key: 'lowercase', label: 'Lowercase (a-z)' },
  { key: 'uppercase', label: 'Uppercase (A-Z)' },
  { key: 'digits', label: 'Digits (0-9)' },
  { key: 'symbols', label: 'Symbols (!@#...)' },
] as const;

type OptionKey = (typeof CHARACTER_SET_OPTIONS)[number]['key'];

export function PasswordLength({
  length,
  onGenerate,
  onLength,
}: {
  length: number;
  onGenerate: () => void;
  onLength: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <Label htmlFor="password-length">Length</Label>
        <NumberField
          maxValue={128}
          minValue={8}
          onChange={onLength}
          value={length}
        >
          <NumberInput id="password-length" />
        </NumberField>
      </div>
      <Button onPress={onGenerate} size="sm">
        <KeyRound className="size-4" />
        Generate
      </Button>
    </div>
  );
}

export function PasswordCharset({
  onToggle,
  options,
}: {
  onToggle: (key: OptionKey | 'excludeAmbiguous', v: boolean) => void;
  options: Record<OptionKey | 'excludeAmbiguous', boolean>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CHARACTER_SET_OPTIONS.map(({ key, label }) => (
          <CheckboxField
            isSelected={options[key]}
            key={key}
            onChange={(selected) => onToggle(key, selected)}
          >
            <Checkbox>{label}</Checkbox>
          </CheckboxField>
        ))}
      </div>
      <CheckboxField
        isSelected={options.excludeAmbiguous}
        onChange={(selected) => onToggle('excludeAmbiguous', selected)}
      >
        <Checkbox>Exclude ambiguous characters (I, l, 1, O, 0, o)</Checkbox>
      </CheckboxField>
    </>
  );
}

export function PasswordOutput({
  copied,
  entropy,
  error,
  isValid,
  onCopy,
  output,
}: {
  copied: boolean;
  entropy: number;
  error?: string;
  isValid: boolean;
  onCopy: () => void;
  output?: string;
}) {
  if (!isValid) {
    return (
      <p className="text-danger text-sm" role="alert">
        {error}
      </p>
    );
  }
  const strength = strengthLabel(entropy);
  return (
    <ResultPanel
      copied={copied}
      copyLabel="Copy password"
      label={`${strength} · ${entropy} bits`}
      onCopy={onCopy}
      value={output ?? ''}
    />
  );
}

export function PasswordHelp() {
  return (
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
  );
}
