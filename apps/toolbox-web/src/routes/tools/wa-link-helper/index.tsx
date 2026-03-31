'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { buildWhatsAppLink, countryCodeOptions } from '@toolbox/wa-link-core';
import { useMemo } from 'react';
import { Form } from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

const formSchema = z.object({
  country_code: z.string().min(1, 'Please select a country'),
  phone_number: z.string().min(1, 'Please enter a phone number'),
  text: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

export const Route = createFileRoute('/tools/wa-link-helper/')({
  component: WALinkHelperPage,
  staticData: {
    pageTitle: 'WhatsApp Link Helper',
  },
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
    <Card className="mx-auto w-full md:w-[80%] md:max-w-lg">
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
                items={countryCodeOptions}
                name={field.name}
                onChange={field.onChange}
                value={field.value}
              >
                <Label htmlFor="country_code">Country Code</Label>
                <ComboBoxInput placeholder="Search country..." />
                <ComboBoxContent items={countryCodeOptions}>
                  {(option) => (
                    <ComboBoxItem id={option.value} textValue={option.label}>
                      {option.label}
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

        {link && isValid && (
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
        )}
      </CardContent>
    </Card>
  );
}
