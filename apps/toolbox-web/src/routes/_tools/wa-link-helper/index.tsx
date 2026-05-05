'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { buildWhatsAppLink, countryCodeOptions } from '@toolbox/wa-link-core';
import { HelpCircleIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Form } from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { Description, FieldError, Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { TextField } from '@/lib/components/ui/text-field';
import { Textarea } from '@/lib/components/ui/textarea';
import { TOOL_META } from '@/lib/utils/metadata';

const formSchema = z.object({
  country_code: z.string().min(1, 'Please select a country'),
  phone_number: z.string().min(1, 'Please enter a phone number'),
  text: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

const meta = TOOL_META['wa-link-helper'];

export const Route = createFileRoute('/_tools/wa-link-helper/')({
  component: WALinkHelperPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

function WALinkHelperPage() {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country_code: 'ID',
      phone_number: '',
      text: '',
    },
  });

  const [countryCode, phoneNumber, text] = form.watch([
    'country_code',
    'phone_number',
    'text',
  ]);

  const { link } = useMemo(
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
    if (!link) {
      return;
    }
    navigator.clipboard.writeText(link);
    toast('Copied Link', {
      description: link,
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
                // <ComboBox
                //   isInvalid={!!errors.country_code}
                //   items={countryCodeOptions}
                //   name={field.name}
                //   onChange={field.onChange}
                //   value={field.value}
                // >
                //   <Label htmlFor="country_code">Country Code</Label>
                //   <ComboBoxInput placeholder="Search country..." />
                //   <ComboBoxContent items={countryCodeOptions}>
                //     {(option) => (
                //       <ComboBoxItem id={option.id} textValue={option.name}>
                //         {option.name}
                //       </ComboBoxItem>
                //     )}
                //   </ComboBoxContent>
                //   <Description>
                //     Select the country for the phone number
                //   </Description>
                //   {errors.country_code && (
                //     <FieldError>{errors.country_code.message}</FieldError>
                //   )}
                // </ComboBox>
                <Select
                  isInvalid={!!errors.country_code}
                  name={field.name}
                  onChange={field.onChange}
                  placeholder="Search country..."
                  value={field.value}
                >
                  <Label htmlFor="country_code">Country Code</Label>
                  <SelectTrigger />
                  <SelectContent items={countryCodeOptions}>
                    {(option) => (
                      <SelectItem id={option.id} textValue={option.name}>
                        {option.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                  <Description>
                    Select the country for the phone number
                  </Description>
                  {errors.country_code && (
                    <FieldError>{errors.country_code.message}</FieldError>
                  )}
                </Select>
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
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DisclosureGroup>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              How to use
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>
                Enter a phone number and optionally a message. The tool
                generates a WhatsApp link that you can copy and share.
              </p>
              <ul className="list-inside list-disc">
                <li>Select the country code first</li>
                <li>Enter the phone number without the country code</li>
                <li>Add an optional pre-filled message</li>
                <li>Click Copy Link to copy the generated URL</li>
              </ul>
            </div>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <HelpCircleIcon className="size-4" />
              FAQ
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">Why no + sign?</p>
                <p>
                  The country code already includes the + prefix. Adding + will
                  cause the link to fail.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">Is my data sent anywhere?</p>
                <p>
                  No. All processing happens in your browser. No phone numbers
                  or messages are stored or transmitted.
                </p>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}
