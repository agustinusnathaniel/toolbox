'use client';

import { ScanSearch, Trash2 } from 'lucide-react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { CopyRow } from '@/lib/components/copy-row';
import { LabeledTextarea } from '@/lib/components/labeled-textarea';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import {
  flagLabel,
  type InspectedChar,
  type InspectionSummary,
  NORMALIZATION_FORMS,
  type NormalizationForm,
} from '@/lib/tools/unicode-inspector/adapters/unicode-inspector';

export function UnicodeInput({
  onClear,
  onCopyLink,
  onInput,
  value,
}: {
  onClear: () => void;
  onCopyLink: () => void;
  onInput: (v: string) => void;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <LabeledTextarea
        aria-label="Text to inspect"
        id="unicode-input"
        label="Text to Inspect"
        onChange={(e) => onInput(e.target.value)}
        placeholder="Paste text here... e.g. Hello, café, emoji 😀"
        value={value}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onClear} size="sm" variant="outline">
          <Trash2 aria-hidden="true" className="size-4" />
          Clear
        </Button>
        <CopyLinkButton label="Copy shareable link" onClick={onCopyLink} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-mono text-lg tabular-nums">{value}</span>
    </div>
  );
}

export function UnicodeSummary({ summary }: { summary: InspectionSummary }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryStat
          label="Characters"
          value={String(summary.totalCodePoints)}
        />
        <SummaryStat
          label="UTF-8 bytes"
          value={String(summary.utf8ByteLength)}
        />
        <SummaryStat label="Invisible" value={String(summary.invisibleCount)} />
        <SummaryStat
          label="Suspicious"
          value={String(summary.suspiciousCount)}
        />
      </div>
      {summary.suspiciousCount > 0 && (
        <p className="rounded-lg border p-3 font-medium text-sm" role="alert">
          {summary.suspiciousCount === 1
            ? '1 bidirectional control character found. These can visually reorder text (Trojan Source spoofing) — check the table below.'
            : `${String(summary.suspiciousCount)} bidirectional control characters found. These can visually reorder text (Trojan Source spoofing) — check the table below.`}
        </p>
      )}
    </div>
  );
}

export function UnicodeNormalization({
  changed,
  copiedKey,
  forms,
  onCopyForm,
}: {
  changed: Array<NormalizationForm>;
  copiedKey: string | null;
  forms: Record<NormalizationForm, string>;
  onCopyForm: (form: NormalizationForm) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <h2 className="font-medium text-sm">Normalization forms</h2>
        {NORMALIZATION_FORMS.map((form) => (
          <div className="flex flex-col gap-1" key={form}>
            <CopyRow
              copied={copiedKey === `form-${form}`}
              copyLabel={`Copy ${form}`}
              label={changed.includes(form) ? `${form} (differs)` : form}
              mono
              onCopy={() => onCopyForm(form)}
              value={forms[form]}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function displayGlyph(char: InspectedChar): string {
  if (char.char.trim() !== '') {
    return char.char;
  }
  return char.name ?? char.codePoint;
}

export function UnicodeTable({
  total,
  truncated,
  visible,
}: {
  total: number;
  truncated: boolean;
  visible: Array<InspectedChar>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 font-medium text-sm">
          <ScanSearch aria-hidden="true" className="size-4" />
          Characters
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-xl caption-bottom font-mono text-xs tabular-nums">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pr-3 pb-2 font-medium">#</th>
                <th className="pr-3 pb-2 font-medium">Glyph</th>
                <th className="pr-3 pb-2 font-medium">Code point</th>
                <th className="pr-3 pb-2 font-medium">UTF-8</th>
                <th className="pr-3 pb-2 font-medium">UTF-16</th>
                <th className="pr-3 pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((char) => (
                <tr className="border-t" key={char.index}>
                  <td className="py-1.5 pr-3">{char.index}</td>
                  <td className="py-1.5 pr-3 text-sm">{displayGlyph(char)}</td>
                  <td className="py-1.5 pr-3">{char.codePoint}</td>
                  <td className="py-1.5 pr-3">{char.utf8}</td>
                  <td className="py-1.5 pr-3">{char.utf16}</td>
                  <td className="py-1.5 pr-3">{char.category}</td>
                  <td className="py-1.5">{flagLabel(char)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {truncated && (
          <p className="text-muted-foreground text-xs">
            {`Showing the first ${String(visible.length)} of ${String(total)} characters. Shorten the input to inspect the rest.`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function UnicodeHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All inspection runs on built-in browser APIs (string iteration, RegExp Unicode properties, TextEncoder). No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'NFC, NFD, NFKC, and NFKD are the four Unicode normalization forms. NFC composes (é as one code point), NFD decomposes (e + combining accent), and the K forms additionally fold compatibility characters like the ﬁ ligature into fi. Identical-looking strings with different forms compare as unequal, which breaks logins, searches, and file lookups.',
          question: 'What are normalization forms?',
        },
        {
          answer:
            'Bidirectional controls (U+202A–U+202E, U+2066–U+2069) can make code or text render in a different order than it is stored — the Trojan Source technique. The summary flags them so you can remove them before trusting pasted content.',
          question: 'What counts as suspicious?',
        },
        {
          answer:
            'Use Copy shareable link to get a URL that restores your input for anyone who opens it.',
          question: 'How do shareable links work?',
        },
      ]}
      howItWorks={{
        description:
          'Paste text to see every code point with its UTF-8 bytes, category, and normalization behavior.',
        steps: [
          'Paste text into the textarea',
          'Read the summary for hidden or suspicious characters',
          'Compare the four normalization forms',
          'Scan the character table for code points and byte values',
          'Copy a shareable link to keep the input',
        ],
      }}
    />
  );
}
