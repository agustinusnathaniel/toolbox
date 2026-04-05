'use client';

import { createFileRoute } from '@tanstack/react-router';
import { parseUserAgent } from '@toolbox/ua-check-core';
import { useMemo } from 'react';

import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';

export const Route = createFileRoute('/tools/ua-check/')({
  component: UACheckPage,
  staticData: {
    pageTitle: 'UA Check',
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
  const result = useMemo(() => parseUserAgent(), []);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-2xl">
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

      <Card>
        <CardHeader title="Features" />
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge intent="success">User Agent Parsing</Badge>
            </li>
            <li className="flex items-center gap-2">
              <Badge intent="info">Browser & OS Detection</Badge>
            </li>
            <li className="flex items-center gap-2">
              <Badge intent="secondary">Engine & CPU Info</Badge>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-fg text-xs">
                No data is sent to any server
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
