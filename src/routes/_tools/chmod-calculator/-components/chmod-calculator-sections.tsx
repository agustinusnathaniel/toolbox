'use client';

import { Fragment } from 'react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { ResultPanel } from '@/lib/components/result-panel';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Field, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  CHMOD_EXAMPLES,
  type ChmodBits,
  type ChmodExample,
} from '@/lib/tools/chmod-calculator/adapters/chmod-calculator';

import type {
  ChmodPermission,
  ChmodPermissionClass,
  ChmodSpecial,
} from './use-chmod-calculator-page';

const PERMISSION_CLASSES: Array<{ key: ChmodPermissionClass; label: string }> =
  [
    { key: 'owner', label: 'Owner' },
    { key: 'group', label: 'Group' },
    { key: 'other', label: 'Other' },
  ];

const PERMISSIONS: Array<{ key: ChmodPermission; label: string }> = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
  { key: 'execute', label: 'Execute' },
];

const SPECIAL_BITS: Array<{
  bit: ChmodSpecial;
  hint: string;
  label: string;
}> = [
  {
    bit: 'setuid',
    hint: 'Run as the file owner (4xxx)',
    label: 'Setuid',
  },
  {
    bit: 'setgid',
    hint: 'Run as the file group (2xxx)',
    label: 'Setgid',
  },
  {
    bit: 'sticky',
    hint: 'Only owners can delete (1xxx)',
    label: 'Sticky',
  },
];

export function ChmodPermissionGrid({
  bits,
  onTogglePermission,
}: {
  bits: ChmodBits;
  onTogglePermission: (
    klass: ChmodPermissionClass,
    permission: ChmodPermission
  ) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium text-sm">Permissions</legend>
      <div className="grid grid-cols-4 items-center gap-2">
        <span aria-hidden="true" />
        {PERMISSIONS.map((permission) => (
          <span
            className="text-center text-muted-foreground text-xs"
            key={permission.key}
          >
            {permission.label}
          </span>
        ))}
        {PERMISSION_CLASSES.map((klass) => (
          <Fragment key={klass.key}>
            <span className="text-muted-foreground text-xs">{klass.label}</span>
            {PERMISSIONS.map((permission) => (
              <Checkbox
                aria-label={`${klass.label} ${permission.label}`}
                checked={bits[klass.key][permission.key]}
                className="justify-self-center"
                key={`${klass.key}-${permission.key}`}
                onCheckedChange={() =>
                  onTogglePermission(klass.key, permission.key)
                }
              />
            ))}
          </Fragment>
        ))}
      </div>
    </fieldset>
  );
}

export function ChmodSpecialBits({
  bits,
  onToggleSpecial,
}: {
  bits: ChmodBits;
  onToggleSpecial: (bit: ChmodSpecial) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium text-sm">Special bits</legend>
      <div className="flex flex-col gap-2">
        {SPECIAL_BITS.map((item) => (
          <label
            className="flex cursor-pointer items-center gap-2 text-sm"
            htmlFor={`chmod-calculator-${item.bit}`}
            key={item.bit}
          >
            <Checkbox
              checked={bits[item.bit]}
              id={`chmod-calculator-${item.bit}`}
              onCheckedChange={() => onToggleSpecial(item.bit)}
            />
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground text-xs">{item.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ChmodOctalInput({
  error,
  onChange,
  value,
}: {
  error: string | null;
  onChange: (v: string) => void;
  value: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="chmod-calculator-octal">Octal mode</FieldLabel>
      <Input
        aria-invalid={error !== null}
        id="chmod-calculator-octal"
        inputMode="numeric"
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 755"
        spellCheck={false}
        value={value}
      />
      {error !== null && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </Field>
  );
}

export function ChmodSymbolicInput({
  error,
  onChange,
  value,
}: {
  error: string | null;
  onChange: (v: string) => void;
  value: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="chmod-calculator-symbolic">
        Symbolic notation
      </FieldLabel>
      <Input
        aria-invalid={error !== null}
        className="font-mono"
        id="chmod-calculator-symbolic"
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. rwxr-xr-x"
        spellCheck={false}
        value={value}
      />
      {error !== null && (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      )}
    </Field>
  );
}

export function ChmodExamples({
  onSelect,
}: {
  onSelect: (example: ChmodExample) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">Try:</span>
      {CHMOD_EXAMPLES.map((example) => (
        <Button
          aria-label={`Load ${example.label} example (${example.octal})`}
          key={example.octal}
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

export function ChmodActions({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
    </div>
  );
}

export function ChmodOutput({
  command,
  copiedKey,
  octal,
  onCopy,
  symbolic,
}: {
  command: string;
  copiedKey: 'command' | 'octal' | 'symbolic' | null;
  octal: string;
  onCopy: (text: string, key: 'command' | 'octal' | 'symbolic') => void;
  symbolic: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ResultPanel
        copied={copiedKey === 'octal'}
        copyLabel="Copy octal mode"
        label="Octal"
        onCopy={() => onCopy(octal, 'octal')}
        value={octal}
      />
      <ResultPanel
        copied={copiedKey === 'symbolic'}
        copyLabel="Copy symbolic notation"
        label="Symbolic"
        onCopy={() => onCopy(symbolic, 'symbolic')}
        value={symbolic}
      />
      <ResultPanel
        copied={copiedKey === 'command'}
        copyLabel="Copy chmod command"
        label="Shell command"
        onCopy={() => onCopy(command, 'command')}
        value={command}
      />
    </div>
  );
}

export function ChmodHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'The leading digit packs three extra flags: 4 = setuid (run as the file owner), 2 = setgid (run as the file group, or inherit the directory group), 1 = sticky (only the owner can delete or rename inside the directory). 4755 means setuid plus rwxr-xr-x.',
          question: 'What does the fourth digit mean?',
        },
        {
          answer:
            'Lowercase s or t means the execute bit is also set (rws, rwt); uppercase S or T means the special bit is set but execute is not (rwS, rwT). Both forms are valid and this tool reads and writes both.',
          question: 'Why is the s sometimes uppercase?',
        },
        {
          answer:
            'Common recipes: 755 for scripts and directories (owner can write, everyone can read and enter), 644 for regular files, 600 for secrets like SSH keys, 1777 for shared temp directories, 4755 for setuid binaries.',
          question: 'Which mode should I use?',
        },
        {
          answer:
            'Yes. Every conversion runs locally in your browser — nothing is uploaded, and only the octal mode travels in the share link.',
          question: 'Is my data safe?',
        },
      ]}
      howItWorks={{
        description:
          'Toggle the permission grid, or type an octal mode or symbolic notation — all three stay in sync.',
        steps: [
          'Toggle read, write, and execute for owner, group, and other',
          'Flip setuid, setgid, or sticky when you need them',
          'Copy the octal mode, the symbolic notation, or the ready-to-paste chmod command',
          'Copy the shareable link to send the exact mode to someone else',
        ],
      }}
    />
  );
}
