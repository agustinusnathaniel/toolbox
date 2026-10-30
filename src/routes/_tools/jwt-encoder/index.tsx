'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { JWT_ENCODER_EXAMPLES } from '@/lib/tools/jwt-encoder/adapters/jwt-encoder';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  JwtEncoderActions,
  JwtEncoderExamples,
  JwtEncoderHelp,
  JwtEncoderInputs,
  JwtEncoderOutput,
  JwtEncoderSecret,
} from './-components/jwt-encoder-sections';
import { useJwtEncoderPage } from './-components/use-jwt-encoder-page';
import { meta } from './-meta';

const searchSchema = z.object({
  alg: z.string().optional(),
  header: z.string().optional(),
  payload: z.string().optional(),
});

export const Route = createFileRoute('/_tools/jwt-encoder/')({
  component: JwtEncoderPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JwtEncoderPage() {
  const { trackAction } = useToolTracking('jwt-encoder', 'JWT Encoder');
  const search = useSearch({ from: '/_tools/jwt-encoder/' });
  const page = useJwtEncoderPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <JwtEncoderInputs
            alg={page.state.alg}
            header={page.state.header}
            onAlg={page.updateAlg}
            onHeader={page.updateHeader}
            onPayload={page.updatePayload}
            payload={page.state.payload}
          />
          <JwtEncoderSecret onChange={page.setSecret} secret={page.secret} />
          <JwtEncoderExamples
            examples={JWT_ENCODER_EXAMPLES}
            onSelect={page.loadExample}
          />
          <JwtEncoderActions
            computing={page.computing}
            onCopyLink={page.handleCopyLink}
            onSign={page.signToken}
          />
          <JwtEncoderOutput
            copied={page.copiedKey === 'token'}
            hasInput={Boolean(
              page.state.header.trim() || page.state.payload.trim()
            )}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <JwtEncoderHelp />
    </div>
  );
}
