'use client';

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { Form } from 'react-aria-components';
import { toast } from 'sonner';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import { buildWALinkSearchParams } from '@/lib/tools/wa-link-helper/adapters/wa-link';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { createToolRouteMetadata } from '@/lib/utils/metadata';
import { recordToSearchParams } from '@/lib/utils/search-params';

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
  const navigate = useNavigate({ from: '/wa-link-helper/' });
  const copyShareableLink = useCopyShareableLink(
    () =>
      recordToSearchParams(
        buildWALinkSearchParams({ countryCode, phoneNumber, text })
      ),
    trackAction,
    'copy_shareable'
  );
  const handleCopyShareableLink = async () => {
    navigate({
      replace: true,
      search: (prev) => ({
        ...prev,
        ...buildWALinkSearchParams({ countryCode, phoneNumber, text }),
      }),
    });
    await copyShareableLink();
  };
  const handleCopyLink = async () => {
    if (!(isPhoneValid && link)) {
      toast('Invalid Phone Number', {
        description:
          'The phone number is not valid for the selected country. Please check and try again.',
      });
      return;
    }
    if (await copyToClipboard(link, 'Copied Link')) {
      trackAction('copy_link');
    }
  };
  const { isValid } = form.formState;

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-lg">
      <Card>
        <CardContent>
          <Form
            className="grid gap-6 text-start"
            onSubmit={form.handleSubmit(() => handleCopyLink())}
          >
            <WaLinkFormFields form={form} />
            <Button type="submit">Copy Link</Button>
          </Form>
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
