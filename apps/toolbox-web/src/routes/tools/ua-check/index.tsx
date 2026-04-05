'use client';

import { createFileRoute } from '@tanstack/react-router';
import { parseUserAgent } from '@toolbox/ua-check-core';
import { HelpCircleIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { TOOL_META } from '@/lib/utils/metadata';

const meta = TOOL_META['ua-check'];

export const Route = createFileRoute('/tools/ua-check/')({
  component: UACheckPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
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
  const result = useMemo(() => parseUserAgent(), []);

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

      <DisclosureGroup>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              How it works
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>
                This tool analyzes your browser&apos;s user agent string to
                identify your browser, operating system, and device information.
              </p>
              <ul className="list-inside list-disc">
                <li>Browser name and version</li>
                <li>Operating system details</li>
                <li>Device type and model</li>
                <li>CPU architecture</li>
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              FAQ
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">Is my data safe?</p>
                <p>
                  Yes. All analysis happens locally in your browser. No data is
                  sent to any server.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">What is a user agent?</p>
                <p>
                  A user agent is a string that your browser sends to websites
                  identifying itself. This tool parses that string for you.
                </p>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}
