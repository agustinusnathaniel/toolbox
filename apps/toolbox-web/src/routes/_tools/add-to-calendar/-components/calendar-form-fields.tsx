import { Form } from 'react-aria-components';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { FieldError, Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { TextField } from '@/lib/components/ui/text-field';
import { Textarea } from '@/lib/components/ui/textarea';

import type { CalendarFormType } from './use-calendar-form';

type CalendarFormFieldsProps = {
  form: UseFormReturn<CalendarFormType>;
  errors: Record<string, { message?: string } | undefined>;
  onSubmit: () => void;
};

export function CalendarFormFields({
  form,
  errors,
  onSubmit,
}: CalendarFormFieldsProps) {
  return (
    <Form
      {...form}
      className="grid gap-6 text-start"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="title"
        render={({ field }) => (
          <TextField
            isInvalid={!!errors.title}
            name={field.name}
            onChange={field.onChange}
            value={field.value}
          >
            <Label htmlFor="title">Title</Label>
            <Input placeholder="Event Title" />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="description"
        render={({ field }) => (
          <TextField
            name={field.name}
            onChange={field.onChange}
            value={field.value}
          >
            <Label htmlFor="description">Description</Label>
            <Textarea placeholder="Describe your event" />
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="location"
        render={({ field }) => (
          <TextField
            name={field.name}
            onChange={field.onChange}
            value={field.value}
          >
            <Label htmlFor="location">Location</Label>
            <Input placeholder="Event Location" />
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="start"
        render={({ field }) => (
          <TextField
            name={field.name}
            onChange={field.onChange}
            value={field.value}
          >
            <Label htmlFor="start">Start</Label>
            <Input type="datetime-local" />
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="end"
        render={({ field }) => (
          <TextField
            isInvalid={!!errors.end}
            name={field.name}
            onChange={field.onChange}
            value={field.value}
          >
            <Label htmlFor="end">End</Label>
            <Input type="datetime-local" />
            {errors.end && <FieldError>{errors.end.message}</FieldError>}
          </TextField>
        )}
      />
    </Form>
  );
}
