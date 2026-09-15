'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useYamlPage } from './-components/use-yaml-page';
import { YamlFormatControls } from './-components/yaml-format-controls';
import { YamlHelp } from './-components/yaml-help';
import { YamlResultView } from './-components/yaml-result-view';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  mode: z.string().optional(),
});

export const Route = createFileRoute('/_tools/yaml-converter/')({
  component: YamlConverterPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function YamlConverterPage() {
  const { trackAction } = useToolTracking('yaml-converter', 'YAML Converter');
  const search = useSearch({ from: '/_tools/yaml-converter/' });
  const page = useYamlPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <YamlFormatControls
            computing={page.computing}
            mode={page.state.mode}
            onClear={page.handleClear}
            onConvert={page.handleConvert}
            onModeChange={page.handleModeChange}
          />
          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="yaml-input">
              {page.state.mode === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
            </label>
            <Textarea
              aria-label="Input data"
              className="min-h-40 font-mono"
              id="yaml-input"
              onChange={(e) => page.handleInputChange(e.target.value)}
              placeholder={
                page.state.mode === 'json-to-yaml'
                  ? 'Paste your JSON here...'
                  : 'Paste your YAML here...'
              }
              value={page.state.input}
            />
          </div>
          <YamlResultView
            computing={page.computing}
            copiedKey={page.copiedKey}
            input={page.state.input}
            mode={page.state.mode}
            onCopy={page.handleCopy}
            onCopyLink={page.handleCopyLink}
            result={page.result}
          />
        </CardContent>
      </Card>
      <YamlHelp />
    </div>
  );
}
