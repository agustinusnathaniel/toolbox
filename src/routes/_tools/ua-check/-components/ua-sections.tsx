'use client';

import { Link as LinkIcon, RotateCcw } from 'lucide-react';

import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import type { parseUserAgent } from '@/lib/tools/ua-check/adapters/ua-check';

type UaResult = ReturnType<typeof parseUserAgent>;

export function UaInfoRow({
  capitalize,
  label,
  value,
}: {
  capitalize?: boolean;
  label: string;
  value: string | undefined;
}) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-fg text-sm">{label}</span>
      <span className={`font-medium ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export function UaInput({
  onChange,
  onCopyLink,
  onUseMine,
  value,
}: {
  onChange: (v: string) => void;
  onCopyLink: () => void;
  onUseMine: () => void;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-muted-fg text-sm" htmlFor="ua-input">
            User Agent String
          </label>
          <Textarea
            className="min-h-24 font-mono text-xs"
            id="ua-input"
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste any user agent string to parse it..."
            value={value}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button intent="outline" onPress={onUseMine} size="sm">
            <RotateCcw className="size-4" />
            Use my browser&apos;s UA
          </Button>
          <Button intent="outline" onPress={onCopyLink} size="sm">
            <LinkIcon className="size-4" />
            Copy link
          </Button>
        </div>
        {!value.trim() && (
          <p className="text-muted-fg text-xs">
            Paste a user agent string above to see its browser, OS, and device
            details.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function UaResultCards({ result }: { result: UaResult }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Browser" />
        <CardContent className="flex flex-col">
          <UaInfoRow label="Browser" value={result.browser.name} />
          <UaInfoRow label="Version" value={result.browser.version} />
          {result.browser.major && (
            <UaInfoRow label="Major Version" value={result.browser.major} />
          )}
          <UaInfoRow label="Engine" value={result.engine.name} />
          {result.engine.version && (
            <UaInfoRow label="Engine Version" value={result.engine.version} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Operating System" />
        <CardContent className="flex flex-col">
          <UaInfoRow label="OS" value={result.os.name} />
          {result.os.version && (
            <UaInfoRow label="Version" value={result.os.version} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Device" />
        <CardContent className="flex flex-col">
          <UaInfoRow
            capitalize
            label="Device Type"
            value={result.device.type}
          />
          <UaInfoRow label="Vendor" value={result.device.vendor} />
          <UaInfoRow label="Model" value={result.device.model} />
        </CardContent>
      </Card>
      {result.cpu.architecture && (
        <Card>
          <CardHeader title="Hardware" />
          <CardContent className="flex flex-col">
            <UaInfoRow
              label="CPU Architecture"
              value={result.cpu.architecture}
            />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader title="Raw User Agent" />
        <CardContent>
          <code className="break-all text-muted-fg text-xs">{result.ua}</code>
        </CardContent>
      </Card>
    </div>
  );
}

export function UaHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All analysis happens locally in your browser. No data is sent to any server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'A user agent is a string that your browser sends to websites identifying itself. This tool parses any user agent string for you.',
          question: 'What is a user agent?',
        },
      ]}
      howItWorks={{
        description:
          'Paste any user agent string — your own, or one from a bug report — to identify the browser, operating system, and device information.',
        steps: [
          'Paste a user agent string into the textarea',
          'Results update live as you type',
          "Click Use my browser's UA to reset to your current browser",
          'Click Copy link to share the parsed result via URL',
        ],
      }}
    />
  );
}
