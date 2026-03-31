'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { countryCodeOptions } from '@toolbox/wa-link-core';
import { parsePhoneNumber } from 'awesome-phonenumber';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import {
  ComboBox,
  ComboBoxContent,
  ComboBoxItem,
  ComboBoxValue,
} from '@/lib/components/ui/combo-box';
import { Description, FieldError, Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/lib/components/ui/popover';
import { Textarea } from '@/lib/components/ui/textarea';

const formSchema = z.object({
  country_code: z.string().min(1, 'Please select a country'),
  phone_number: z.string().min(1, 'Please enter a phone number'),
  text: z.string().optional(),
});

type FormType = z.infer<typeof formSchema>;

export const Route = createFileRoute('/tools/wa-link-helper/')({
  component: WALinkHelperPage,
});

function buildLink(
  countryCode: string,
  phoneNumber: string,
  text: string
): string {
  if (!phoneNumber) {
    return '';
  }
  if (!countryCode) {
    return '';
  }
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, {
    regionCode: countryCode,
  });
  if (!parsedPhoneNumber.valid) {
    return '';
  }
  const e164 = parsedPhoneNumber.number?.e164;
  if (!e164) {
    return '';
  }
  const encodedText = text.length > 0 ? encodeURIComponent(text) : '';
  const message = encodedText.length > 0 ? `?text=${encodedText}` : '';
  return `https://wa.me/${encodeURIComponent(e164)}${message}`;
}

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

  const generatedLink = buildLink(countryCode, phoneNumber, text ?? '');

  const { isValid } = form.formState;

  const handleCopyLink = () => {
    if (!generatedLink) {
      return;
    }
    navigator.clipboard.writeText(generatedLink);
    toast('Copied Link', {
      description: generatedLink,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      handleCopyLink();
    }
  };

  const selectedCountryOption = countryCodeOptions.find(
    (option) => option.value === countryCode
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="WhatsApp Link Helper" />
        <CardContent>
          <form className="grid gap-6 text-start" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="country">Country Code</Label>
              <Popover>
                <PopoverTrigger>
                  <Button
                    className="w-full justify-between text-start"
                    intent="outline"
                  >
                    {selectedCountryOption?.label ?? 'Select Country'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <ComboBox
                    items={countryCodeOptions}
                    onSelectionChange={(key) => {
                      form.setValue('country_code', key as string);
                    }}
                    selectedKey={countryCode}
                  >
                    <ComboBoxContent>
                      {countryCodeOptions.map((option) => (
                        <ComboBoxItem
                          key={option.value}
                          textValue={option.label}
                        >
                          <ComboBoxValue>{option.label}</ComboBoxValue>
                        </ComboBoxItem>
                      ))}
                    </ComboBoxContent>
                  </ComboBox>
                </PopoverContent>
              </Popover>
              <Description>Select the country for the phone number</Description>
              {form.formState.errors.country_code && (
                <FieldError>
                  {form.formState.errors.country_code.message}
                </FieldError>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                onChange={(e) => {
                  form.setValue('phone_number', e.target.value);
                }}
                placeholder="Enter phone number"
                type="number"
                value={phoneNumber}
              />
              <Description>
                Enter the phone number without country code
              </Description>
              {form.formState.errors.phone_number && (
                <FieldError>
                  {form.formState.errors.phone_number.message}
                </FieldError>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text">Message (optional)</Label>
              <Textarea
                id="text"
                onChange={(e) => {
                  form.setValue('text', e.target.value);
                }}
                placeholder="Enter pre-filled message"
                value={text}
              />
              <Description>
                Optionally add a pre-filled message that will appear in the chat
              </Description>
            </div>

            <Button isDisabled={!isValid} type="submit">
              Copy Link
            </Button>
          </form>

          {generatedLink && isValid && (
            <div className="mt-6 flex flex-col gap-2">
              <Label>Generated Link</Label>
              <Button
                className="w-full flex-wrap break-all text-start"
                intent="plain"
              >
                <a
                  href={generatedLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {generatedLink}
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
