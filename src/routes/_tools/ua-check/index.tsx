'use client';

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { parseUserAgent } from '@/lib/tools/ua-check/adapters/ua-check';

import { meta } from './-meta';

export const Route = createFileRoute('/_tools/ua-check/')({
  component: UACheckPage,
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
  const result = useMemo(() => parseUserAgent(), []);

  useEffect(() => {
    trackAction('view');
    trackComplete(true);
  }, [trackAction, trackComplete]);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] lg:grid lg:grid-cols-2">
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
          <InfoRow capitalize label="Device Type" value={result.device.type} />
          <InfoRow label="Vendor" value={result.device.vendor} />
          <InfoRow label="Model" value={result.device.model} />
        </CardContent>
      </Card>

      {result.cpu.architecture && (
        <Card>
          <CardHeader title="Hardware" />
          <CardContent className="flex flex-col">
            <InfoRow label="CPU Architecture" value={result.cpu.architecture} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title="Raw User Agent" />
        <CardContent>
          <code className="break-all text-muted-fg text-xs">{result.ua}</code>
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All analysis happens locally in your browser. No data is sent to any server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'A user agent is a string that your browser sends to websites identifying itself. This tool parses that string for you.',
            question: 'What is a user agent?',
          },
        ]}
        howItWorks={{
          description:
            "This tool analyzes your browser's user agent string to identify your browser, operating system, and device information.",
          steps: [
            'Browser name and version',
            'Operating system details',
            'Device type and model',
            'CPU architecture',
          ],
        }}
      />
    </div>
  );
}
