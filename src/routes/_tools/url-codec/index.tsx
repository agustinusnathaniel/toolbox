'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  UrlCodecActions,
  UrlCodecDirectionBar,
  UrlCodecHelp,
  UrlCodecInputs,
  UrlCodecModeBar,
  UrlCodecResult,
} from './-components/url-codec-sections';
import {
  getUrlCodecResultLabel,
  useUrlCodecPage,
} from './-components/use-url-codec-page';
import { meta } from './-meta';

const searchSchema = z.object({
  direction: z.enum(['decode', 'encode']).optional(),
  input: z.string().optional(),
  mode: z.enum(['component', 'full']).optional(),
});

export const Route = createFileRoute('/_tools/url-codec/')({
  component: UrlCodecPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function UrlCodecPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'url-codec',
    'URL Encoder & Decoder'
  );
  const search = useSearch({ from: '/_tools/url-codec/' });
  const { copiedKey, handleCopy, handleCopyLink, result, setState, state } =
    useUrlCodecPage(search, trackAction, trackComplete);
  const resultLabel = getUrlCodecResultLabel(
    state.direction,
    result?.isValid ?? false
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <UrlCodecInputs
            input={state.input}
            onInput={(input) => setState((prev) => ({ ...prev, input }))}
          />
          <UrlCodecDirectionBar
            direction={state.direction}
            onChange={(direction) =>
              setState((prev) => ({ ...prev, direction }))
            }
            track={trackAction}
          />
          <UrlCodecModeBar
            mode={state.mode}
            onChange={(mode) => setState((prev) => ({ ...prev, mode }))}
            track={trackAction}
          />
          <UrlCodecActions onCopyLink={handleCopyLink} />
          <UrlCodecResult
            copied={copiedKey === 'copy'}
            label={resultLabel}
            onCopy={handleCopy}
            result={result}
          />
        </CardContent>
      </Card>
      <UrlCodecHelp />
    </div>
  );
}
