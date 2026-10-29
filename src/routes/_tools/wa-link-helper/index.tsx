'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useRef } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { focusFirstInvalidField } from '@/lib/hooks/use-focus-first-error';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { copyWaLink, useWaLinkCopy } from './-components/use-wa-link-copy';
import { useWaLinkForm } from './-components/use-wa-link-form';
import { WaLinkFormFields } from './-components/wa-link-form-fields';
import { WaLinkHelp, WaLinkResult } from './-components/wa-link-result';
import { meta } from './-meta';

const searchSchema = z.object({
  cc: z.string().optional(),
  phone: z.string().optional(),
  text: z.string().optional(),
});

export const Route = createFileRoute('/_tools/wa-link-helper/')({
  component: WALinkHelperPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function WALinkHelperPage() {
  const { trackAction } = useToolTracking('wa-link-helper', 'WA Link Helper');
  const search = useSearch({ from: '/_tools/wa-link-helper/' });
  const { countryCode, form, isPhoneValid, link, phoneNumber, text } =
    useWaLinkForm(search);
  const { handleCopyShareableLink } = useWaLinkCopy({
    countryCode,
    onCopy: trackAction,
    phoneNumber,
    text,
  });
  const { isValid } = form.formState;
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-lg">
      <Card>
        <CardContent>
          <form
            className="grid gap-6 text-start"
            onSubmit={form.handleSubmit(
              () => copyWaLink(link, isPhoneValid, trackAction),
              () => focusFirstInvalidField(formRef.current)
            )}
            ref={formRef}
          >
            <WaLinkFormFields form={form} />
            <Button type="submit">Copy Link</Button>
          </form>
          <WaLinkResult
            isValid={isValid}
            link={link}
            onCopyShareable={handleCopyShareableLink}
          />
        </CardContent>
      </Card>
      <WaLinkHelp />
    </div>
  );
}
