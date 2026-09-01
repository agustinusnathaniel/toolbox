'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Textarea } from '@/lib/components/ui/textarea';
import { useCopyFeedback } from '@/lib/hooks/use-copy-feedback';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { YamlMode } from '@/lib/tools/yaml-converter/adapters/yaml-params';
import {
  buildYamlParams,
  buildYamlStateFromSearch,
} from '@/lib/tools/yaml-converter/adapters/yaml-params';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { useYamlConverter } from './-components/use-yaml-converter';
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
  const [state, setState] = useState(() => buildYamlStateFromSearch(search));
  const [convertTrigger, setConvertTrigger] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();

  const { computing, result, setResult } = useYamlConverter(
    state.input,
    state.mode,
    convertTrigger
  );

  const handleModeChange = useCallback(
    (mode: YamlMode) => {
      setState((prev) => ({ ...prev, mode }));
      setResult(null);
    },
    [setResult]
  );

  const handleInputChange = useCallback(
    (input: string) => {
      setState((prev) => ({ ...prev, input }));
      setResult(null);
    },
    [setResult]
  );

  const handleConvert = useCallback(() => {
    setResult(null);
    setConvertTrigger((t) => t + 1);
    trackAction('convert');
  }, [setResult, trackAction]);

  const handleClear = useCallback(() => {
    setState((prev) => ({ ...prev, input: '' }));
    setResult(null);
    setConvertTrigger(0);
    trackAction('clear');
  }, [setResult, trackAction]);

  const handleCopy = useCallback(async () => {
    if (!(result?.isValid && result.output)) {
      return;
    }
    if (await copy(result.output, 'copy', 'Copied Output')) {
      trackAction('copy');
    }
  }, [result, copy, trackAction]);

  const handleCopyLink = useCopyShareableLink(
    () => buildYamlParams(state.input, state.mode),
    trackAction
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <YamlFormatControls
            computing={computing}
            mode={state.mode}
            onClear={handleClear}
            onConvert={handleConvert}
            onModeChange={handleModeChange}
          />

          <div className="flex flex-col gap-1">
            <label className="text-muted-fg text-sm" htmlFor="yaml-input">
              {state.mode === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
            </label>
            <Textarea
              aria-label="Input data"
              className="min-h-40 font-mono"
              id="yaml-input"
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                state.mode === 'json-to-yaml'
                  ? 'Paste your JSON here...'
                  : 'Paste your YAML here...'
              }
              value={state.input}
            />
          </div>

          <YamlResultView
            computing={computing}
            copiedKey={copiedKey}
            input={state.input}
            mode={state.mode}
            onCopy={handleCopy}
            onCopyLink={handleCopyLink}
            result={result}
          />
        </CardContent>
      </Card>

      <YamlHelp />
    </div>
  );
}
