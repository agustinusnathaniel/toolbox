import { useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { focusFirstInvalidField } from '@/lib/hooks/use-focus-first-error';

import type { CalendarFormType } from './use-calendar-form';

type CalendarFormFieldsProps = {
  form: UseFormReturn<CalendarFormType>;
  errors: Record<string, { message?: string } | undefined>;
  onSubmit: () => void;
};

function TitleField({
  form,
  errors,
}: Pick<CalendarFormFieldsProps, 'form' | 'errors'>) {
  return (
    <Controller
      control={form.control}
      name="title"
      render={({ field }) => (
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            aria-invalid={!!errors.title}
            id="title"
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Event Title"
            ref={field.ref}
            value={field.value}
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>
      )}
    />
  );
}

function DescriptionField({ form }: Pick<CalendarFormFieldsProps, 'form'>) {
  return (
    <Controller
      control={form.control}
      name="description"
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Describe your event"
            ref={field.ref}
            value={field.value}
          />
        </Field>
      )}
    />
  );
}

function LocationField({ form }: Pick<CalendarFormFieldsProps, 'form'>) {
  return (
    <Controller
      control={form.control}
      name="location"
      render={({ field }) => (
        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            placeholder="Event Location"
            ref={field.ref}
            value={field.value}
          />
        </Field>
      )}
    />
  );
}

function DateTimeField({
  form,
  errors,
  name,
  label,
}: Pick<CalendarFormFieldsProps, 'form' | 'errors'> & {
  name: 'start' | 'end';
  label: string;
}) {
  const error = errors[name];
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            aria-invalid={!!error}
            id={name}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            ref={field.ref}
            type="datetime-local"
            value={field.value}
          />
          {error && <FieldError>{error.message}</FieldError>}
        </Field>
      )}
    />
  );
}

export function CalendarFormFields({
  form,
  errors,
  onSubmit,
}: CalendarFormFieldsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      className="grid gap-6 text-start"
      onSubmit={form.handleSubmit(onSubmit, () =>
        focusFirstInvalidField(formRef.current)
      )}
      ref={formRef}
    >
      <TitleField errors={errors} form={form} />
      <DescriptionField form={form} />
      <LocationField form={form} />
      <DateTimeField errors={errors} form={form} label="Start" name="start" />
      <DateTimeField errors={errors} form={form} label="End" name="end" />
    </form>
  );
}
