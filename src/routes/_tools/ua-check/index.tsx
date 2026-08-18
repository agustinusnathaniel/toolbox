'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { Link as LinkIcon, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { parseUserAgent } from '@/lib/tools/ua-check/adapters/ua-check';
import { buildUaParams } from '@/lib/tools/ua-check/adapters/ua-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { meta } from './-meta';

const searchSchema = z.object({
  ua: z.string().optional(),
});

export const Route = createFileRoute('/_tools/ua-check/')({
  component: UACheckPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

interface InfoRowProps {
  capitalize?: boolean;
  label: string;
  value: string | undefined;
}

const InfoRow = ({ label, value, capitalize }: InfoRowProps) => {
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
};

function UACheckPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'ua-check',
    'UA Check'
  );
  const search = useSearch({ from: '/_tools/ua-check/' });
  const [uaInput, setUaInput] = useState(search.ua ?? navigator.userAgent);

  const result = useMemo(() => parseUserAgent(uaInput), [uaInput]);

  useEffect(() => {
    trackAction('view');
    trackComplete(true);
  }, [trackAction, trackComplete]);

  const handleUseMyUA = useCallback(() => {
    setUaInput(navigator.userAgent);
    trackAction('use_my_ua');
  }, [trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildUaParams(uaInput),
    trackAction
  );

  const hasInput = uaInput.trim().length > 0;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="ua-input">
              User Agent String
            </label>
            <Textarea
              className="min-h-24 font-mono text-xs"
              id="ua-input"
              onChange={(e) => setUaInput(e.target.value)}
              placeholder="Paste any user agent string to parse it..."
              value={uaInput}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button intent="outline" onPress={handleUseMyUA} size="sm">
              <RotateCcw className="size-4" />
              Use my browser&apos;s UA
            </Button>
            <Button intent="outline" onPress={handleCopyLink} size="sm">
              <LinkIcon className="size-4" />
              Copy link
            </Button>
          </div>

          {!hasInput && (
            <p className="text-muted-fg text-xs">
              Paste a user agent string above to see its browser, OS, and device
              details.
            </p>
          )}
        </CardContent>
      </Card>

      {hasInput && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Browser" />
            <CardContent className="flex flex-col">
              <InfoRow label="Browser" value={result.browser.name} />
              <InfoRow label="Version" value={result.browser.version} />
              {result.browser.major && (
                <InfoRow label="Major Version" value={result.browser.major} />
              )}
              <InfoRow label="Engine" value={result.engine.name} />
              {result.engine.version && (
                <InfoRow label="Engine Version" value={result.engine.version} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Operating System" />
            <CardContent className="flex flex-col">
              <InfoRow label="OS" value={result.os.name} />
              {result.os.version && (
                <InfoRow label="Version" value={result.os.version} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Device" />
            <CardContent className="flex flex-col">
              <InfoRow
                capitalize
                label="Device Type"
                value={result.device.type}
              />
              <InfoRow label="Vendor" value={result.device.vendor} />
              <InfoRow label="Model" value={result.device.model} />
            </CardContent>
          </Card>

          {result.cpu.architecture && (
            <Card>
              <CardHeader title="Hardware" />
              <CardContent className="flex flex-col">
                <InfoRow
                  label="CPU Architecture"
                  value={result.cpu.architecture}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title="Raw User Agent" />
            <CardContent>
              <code className="break-all text-muted-fg text-xs">
                {result.ua}
              </code>
            </CardContent>
          </Card>
        </div>
      )}

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
    </div>
  );
}
