'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useXmlPage } from './-components/use-xml-page';
import {
  XmlActions,
  XmlHelp,
  XmlInput,
  XmlOutput,
} from './-components/xml-sections';
import { meta } from './-meta';

const searchSchema = z.object({
  indent: z.string().optional(),
  input: z.string().optional(),
});

export const Route = createFileRoute('/_tools/xml-formatter/')({
  component: XmlFormatterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function XmlFormatterPage() {
  const { trackAction } = useToolTracking('xml-formatter', 'XML Formatter');
  const search = useSearch({ from: '/_tools/xml-formatter/' });
  const page = useXmlPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <XmlActions
            indent={page.state.indent}
            onCopyLink={page.handleCopyLink}
            onIndentChange={page.handleIndentChange}
            onRun={page.runAction}
          />
          <XmlInput onInput={page.handleInputChange} value={page.state.input} />
          <XmlOutput
            activeAction={page.activeAction}
            copied={page.copiedKey === 'copy'}
            hasInput={Boolean(page.state.input.trim())}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <XmlHelp />
    </div>
  );
}
