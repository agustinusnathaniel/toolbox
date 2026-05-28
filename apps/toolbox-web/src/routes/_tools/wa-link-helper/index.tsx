'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { Form } from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ToolHelp } from '@/lib/components/tool-help';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import {
  ComboBox,
  ComboBoxContent,
  ComboBoxInput,
  ComboBoxItem,
} from '@/lib/components/ui/combo-box';
import { Description, FieldError, Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { TextField } from '@/lib/components/ui/text-field';
import { Textarea } from '@/lib/components/ui/textarea';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  buildWhatsAppLink,
  countryCodeOptions,
} from '@/lib/tools/wa-link-helper/adapters/wa-link';

const formSchema = z.object({
  country_code: z.string().min(1, 'Please select a country'),
  phone_number: z.string().min(1, 'Please enter a phone number'),
  text: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

const searchSchema = z.object({
  cc: z.string().optional(),
  phone: z.string().optional(),
  text: z.string().optional(),
});

const meta = {
  pageTitle: 'WA Link Helper',
  description:
    'Generate WhatsApp links with pre-filled messages and country codes.',
  slug: 'wa-link-helper',
} as const;

export const Route = createFileRoute('/_tools/wa-link-helper/')({
  component: WALinkHelperPage,
  validateSearch: searchSchema,
  staticData: {
    meta,
  },
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.pageTitle },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

const STORAGE_KEY = 'toolbox:wa-link-helper';

const defaultFormValues: FormType = {
  country_code: 'ID',
  phone_number: '',
  text: '',
};

function WALinkHelperPage() {
  const search = useSearch({ from: '/_tools/wa-link-helper/' });
  const navigate = useNavigate({ from: '/wa-link-helper/' });
  const [saved, setSaved] = usePersistedState(STORAGE_KEY, defaultFormValues);

  const initialValues: FormType = {
    country_code: search.cc ?? saved.country_code,
    phone_number: search.phone ?? saved.phone_number,
    text: search.text ?? saved.text,
  };

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setSaved({
        country_code: values.country_code ?? '',
        phone_number: values.phone_number ?? '',
        text: values.text ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSaved]);

  const [countryCode, phoneNumber, text] = form.watch([
    'country_code',
    'phone_number',
    'text',
  ]);

  const { link, isValid: isPhoneValid } = useMemo(
    () =>
      buildWhatsAppLink({
        countryCode,
        phoneNumber,
        text,
      }),
    [countryCode, phoneNumber, text]
  );

  const { isValid, errors } = form.formState;

  const handleCopyLink = () => {
    if (!(isPhoneValid && link)) {
      toast('Invalid Phone Number', {
        description:
          'The phone number is not valid for the selected country. Please check and try again.',
      });
      return;
    }
    navigator.clipboard.writeText(link);
    toast('Copied Link', {
      description: link,
    });
  };

  const handleCopyShareableLink = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        cc: countryCode || undefined,
        phone: phoneNumber || undefined,
        text: text || undefined,
      }),
      replace: true,
    });
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast('Copied Shareable Link', {
      description: 'Link with your current values copied to clipboard.',
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-lg">
      <Card>
        <CardContent>
          <Form
            {...form}
            className="grid gap-6 text-start"
            onSubmit={form.handleSubmit(handleCopyLink)}
          >
            <Controller
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <ComboBox
                  isInvalid={!!errors.country_code}
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                >
                  <Label htmlFor="country_code">Country Code</Label>
                  <ComboBoxInput placeholder="Search country..." />
                  <ComboBoxContent items={countryCodeOptions}>
                    {(option) => (
                      <ComboBoxItem id={option.id} textValue={option.name}>
                        {option.name}
                      </ComboBoxItem>
                    )}
                  </ComboBoxContent>
                  <Description>
                    Select the country for the phone number
                  </Description>
                  {errors.country_code && (
                    <FieldError>{errors.country_code.message}</FieldError>
                  )}
                </ComboBox>
              )}
            />

            <Controller
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors.phone_number}
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                >
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input type="number" />
                  <Description>
                    Enter the phone number without country code
                  </Description>
                  {errors.phone_number && (
                    <FieldError>{errors.phone_number.message}</FieldError>
                  )}
                </TextField>
              )}
            />

            <Controller
              control={form.control}
              name="text"
              render={({ field }) => (
                <TextField
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                >
                  <Label htmlFor="text">Message (optional)</Label>
                  <Textarea />
                  <Description>
                    Optionally add a pre-filled message that will appear in the
                    chat
                  </Description>
                </TextField>
              )}
            />

            <Button type="submit">Copy Link</Button>
          </Form>

          {link && isValid ? (
            <div className="mt-6 flex flex-col gap-2">
              <Label>Generated Link</Label>
              <Button
                className="w-full flex-wrap break-all text-start"
                intent="plain"
              >
                <a href={link} rel="noopener noreferrer" target="_blank">
                  {link}
                </a>
              </Button>
              <Button intent="outline" onPress={handleCopyShareableLink}>
                Copy Shareable Link
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            question: 'Why no + sign?',
            answer:
              'The country code already includes the + prefix. Adding + will cause the link to fail.',
          },
          {
            question: 'Is my data sent anywhere?',
            answer:
              'No. All processing happens in your browser. No phone numbers or messages are stored or transmitted.',
          },
        ]}
        howItWorks={{
          title: 'How to use',
          description:
            'Enter a phone number and optionally a message. The tool generates a WhatsApp link that you can copy and share.',
          steps: [
            'Select the country code first',
            'Enter the phone number without the country code',
            'Add an optional pre-filled message',
            'Click Copy Link to copy the generated URL',
          ],
        }}
      />
    </div>
  );
}
