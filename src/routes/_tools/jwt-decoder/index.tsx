'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  JwtClaims,
  JwtDecodeActions,
  JwtHelp,
  JwtSecretInput,
  JwtStatus,
  JwtTokenInput,
  JwtVerifyBar,
} from './-components/jwt-sections';
import { useJwtPage } from './-components/use-jwt-page';
import { meta } from './-meta';

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/_tools/jwt-decoder/')({
  component: JwtDecoderPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JwtDecoderPage() {
  const { trackAction } = useToolTracking('jwt-decoder', 'JWT Decoder');
  const search = useSearch({ from: '/_tools/jwt-decoder/' });
  const page = useJwtPage(search.token ?? '', trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <JwtTokenInput
            onChange={(v) => {
              page.setToken(v);
              page.clearResults();
            }}
            token={page.token}
          />
          <JwtDecodeActions
            onCopyLink={page.handleCopyLink}
            onDecode={page.handleDecode}
          />
          <JwtSecretInput onChange={page.setSecret} secret={page.secret} />
          <JwtVerifyBar onVerify={page.handleVerify} />
          {page.verifyResult && (
            <JwtStatus
              isValid={page.verifyResult.isValid}
              message={page.verifyResult.message}
            />
          )}
          {page.result && !page.result.isValid && (
            <JwtStatus error={page.result.error} isValid={false} />
          )}
          {page.result?.isValid && (
            <JwtClaims
              claims={page.result.claims}
              copiedKey={page.copiedKey}
              header={page.result.header}
              headerRaw={page.result.headerRaw}
              onCopy={page.handleCopy}
              payload={page.result.payload}
              payloadRaw={page.result.payloadRaw}
            />
          )}
        </CardContent>
      </Card>
      <JwtHelp />
    </div>
  );
}
