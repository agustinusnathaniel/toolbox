'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import {
  formatLocalDateTimeString,
  generateGoogleCalendarLink,
} from '@toolbox/calendar-core';
import { HelpCircleIcon, InfoIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Form } from 'react-aria-components';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/lib/components/ui/card';
import {
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/lib/components/ui/disclosure-group';
import { FieldError, Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { TextField } from '@/lib/components/ui/text-field';
import { Textarea } from '@/lib/components/ui/textarea';
import { TOOL_META } from '@/lib/utils/metadata';

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    location: z.string().optional(),
    start: z.string().min(1, 'Start date/time is required'),
    end: z.string().min(1, 'End date/time is required'),
  })
  .refine((data) => new Date(data.end) >= new Date(data.start), {
    message: 'End date/time cannot be earlier than start date/time',
    path: ['end'],
  });

type FormType = z.infer<typeof formSchema>;

const meta = TOOL_META['add-to-calendar'];

export const Route = createFileRoute('/_tools/add-to-calendar/')({
  component: AddToCalendarPage,
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

function AddToCalendarPage() {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      start: formatLocalDateTimeString(),
      end: formatLocalDateTimeString(),
    },
  });

  const [title, description, location, start, end] = form.watch([
    'title',
    'description',
    'location',
    'start',
    'end',
  ]);

  const linkResult = useMemo(
    () =>
      generateGoogleCalendarLink({
        title: title || '',
        description: description || undefined,
        location: location || undefined,
        start,
        end,
      }),
    [title, description, location, start, end]
  );

  const { isValid, errors } = form.formState;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkResult.url);
    toast('Copied Link', {
      description: 'Calendar link copied to clipboard',
    });
  };

  const handleGenerateEmbed = () => {
    const embed = `<a href="${linkResult.url}" target="_blank" rel="noopener noreferrer" style="border:1px solid black;padding:6px;border-radius:6px;text-decoration:none;color:white;font-weight:400;background-color:black;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;">Add to Google Calendar</a>`;
    navigator.clipboard.writeText(embed);
    toast('Copied Embed Code', {
      description: 'Embed HTML copied to clipboard',
    });
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardHeader title="Event Info" />
        <CardDescription className="px-6 pb-4">
          Enter the details for your calendar event.
        </CardDescription>
        <CardContent>
          <Form
            {...form}
            className="grid gap-6 text-start"
            onSubmit={form.handleSubmit(handleCopyLink)}
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
                  {errors.title && (
                    <FieldError>{errors.title.message}</FieldError>
                  )}
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

          {isValid ? (
            <div className="mt-6 flex flex-col gap-4">
              <Card>
                <CardHeader title="Calendar Link" />
                <CardContent className="flex flex-col gap-4">
                  <div className="rounded-md bg-muted p-3">
                    <code className="break-all font-mono text-xs">
                      {linkResult.url}
                    </code>
                  </div>
                  <Button
                    className="w-full"
                    intent="primary"
                    onPress={handleCopyLink}
                  >
                    Copy Link
                  </Button>
                  <p className="text-center text-muted-fg text-xs">
                    You can copy this link to your custom button or share it
                    anywhere.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Embed Button" />
                <CardContent className="flex flex-col gap-4">
                  <Button
                    className="w-full"
                    intent="secondary"
                    onPress={handleGenerateEmbed}
                  >
                    Copy Embed Button
                  </Button>
                  <p className="text-center text-muted-fg text-xs">
                    Copy the embed button to your web page.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DisclosureGroup>
        <Disclosure>
          <DisclosureTrigger>
            <span className="flex items-center gap-2">
              <InfoIcon className="size-4" />
              How it works
            </span>
          </DisclosureTrigger>
          <DisclosurePanel>
            <div className="flex flex-col gap-3 text-muted-fg text-sm">
              <p>
                Generate an &quot;Add to Calendar&quot; link for Google
                Calendar. Fill in the event details and click Generate to create
                a link that can be added to any calendar.
              </p>
              <ul className="list-inside list-disc">
                <li>Enter event title, description, and location</li>
                <li>Set start and end date/time</li>
                <li>Copy the generated link or embed button</li>
                <li>Share anywhere or add to your website</li>
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
                <p className="font-medium text-fg">Is my data safe?</p>
                <p>
                  Yes. All calendar links are generated locally in your browser.
                  No data is sent to any server.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-fg">
                  Which calendars are supported?
                </p>
                <p>
                  Currently only Google Calendar is supported. The link format
                  follows Google&apos;s calendar event link specification.
                </p>
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    </div>
  );
}
