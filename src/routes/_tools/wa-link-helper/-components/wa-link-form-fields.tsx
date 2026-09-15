'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';

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
import { countryCodeOptions } from '@/lib/tools/wa-link-helper/adapters/wa-link';

import type { WaLinkFormType } from './use-wa-link-form';

export function WaLinkFormFields({
  form,
}: {
  form: UseFormReturn<WaLinkFormType>;
}) {
  const { errors } = form.formState;
  return (
    <>
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
            <Description>Select the country for the phone number</Description>
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
            <Input inputMode="numeric" type="tel" />
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
              Optionally add a pre-filled message that will appear in the chat
            </Description>
          </TextField>
        )}
      />
    </>
  );
}
