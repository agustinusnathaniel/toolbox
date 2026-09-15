'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  PasswordCharset,
  PasswordHelp,
  PasswordLength,
  PasswordOutput,
} from './-components/password-sections';
import { usePasswordPage } from './-components/use-password-page';
import { meta } from './-meta';

const searchSchema = z.object({
  digits: z.string().optional(),
  excludeAmbiguous: z.string().optional(),
  length: z.string().optional(),
  lowercase: z.string().optional(),
  symbols: z.string().optional(),
  uppercase: z.string().optional(),
});

export const Route = createFileRoute('/_tools/password-generator/')({
  component: PasswordGeneratorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function PasswordGeneratorPage() {
  const { trackAction } = useToolTracking(
    'password-generator',
    'Password Generator'
  );
  const search = useSearch({ from: '/_tools/password-generator/' });
  const page = usePasswordPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <PasswordLength
            length={page.options.length}
            onGenerate={page.handleGenerate}
            onLength={(v) =>
              page.setOptions((prev) => ({
                ...prev,
                length: v ?? prev.length,
              }))
            }
          />
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton
              label="Copy shareable link"
              onPress={page.handleCopyLink}
            />
          </div>
          <PasswordCharset
            onToggle={(key, selected) =>
              page.setOptions((prev) => ({ ...prev, [key]: selected }))
            }
            options={page.options}
          />
          {page.result && (
            <PasswordOutput
              copied={page.copiedKey === 'copy'}
              entropy={page.entropy}
              error={page.result.error}
              isValid={page.result.isValid}
              onCopy={page.handleCopy}
              output={page.result.output}
            />
          )}
        </CardContent>
      </Card>
      <PasswordHelp />
    </div>
  );
}
