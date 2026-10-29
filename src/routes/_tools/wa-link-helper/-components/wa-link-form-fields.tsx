'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/lib/components/ui/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { countryCodeOptions } from '@/lib/tools/wa-link-helper/adapters/wa-link';

import type { WaLinkFormType } from './use-wa-link-form';

type CountryOption = (typeof countryCodeOptions)[number];

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
          <Field data-invalid={!!errors.country_code}>
            <FieldLabel htmlFor="country_code">Country Code</FieldLabel>
            <Combobox
              items={countryCodeOptions}
              itemToStringValue={(option: CountryOption) => option.name}
              name={field.name}
              onValueChange={(option: CountryOption | null) => {
                field.onChange(option ? option.id : '');
              }}
              value={
                countryCodeOptions.find(
                  (option) => option.id === field.value
                ) ?? null
              }
            >
              <ComboboxInput
                aria-invalid={!!errors.country_code}
                id="country_code"
                placeholder="Search country..."
              />
              <ComboboxContent>
                <ComboboxEmpty>No countries found.</ComboboxEmpty>
                <ComboboxList>
                  {(option: CountryOption) => (
                    <ComboboxItem key={option.id} value={option}>
                      {option.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FieldDescription>
              Select the country for the phone number
            </FieldDescription>
            {errors.country_code && (
              <FieldError>{errors.country_code.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <Field data-invalid={!!errors.phone_number}>
            <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
            <Input
              aria-invalid={!!errors.phone_number}
              id="phone"
              inputMode="numeric"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              ref={field.ref}
              type="tel"
              value={field.value}
            />
            <FieldDescription>
              Enter the phone number without country code
            </FieldDescription>
            {errors.phone_number && (
              <FieldError>{errors.phone_number.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="text"
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="text">Message (optional)</FieldLabel>
            <Textarea
              id="text"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              ref={field.ref}
              value={field.value}
            />
            <FieldDescription>
              Optionally add a pre-filled message that will appear in the chat
            </FieldDescription>
          </Field>
        )}
      />
    </>
  );
}
