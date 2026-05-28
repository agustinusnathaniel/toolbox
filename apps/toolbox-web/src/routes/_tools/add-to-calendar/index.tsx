'use client';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ToolHelp } from '@/lib/components/tool-help';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/lib/components/ui/card';

import { CalendarFormFields } from './-components/calendar-form-fields';
import { CalendarResultCards } from './-components/calendar-result-cards';
import { useCalendarForm } from './-components/use-calendar-form';

const searchSchema = z.object({
  title: z.string().optional(),
  desc: z.string().optional(),
  loc: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});

const meta = {
  pageTitle: 'Add to Calendar',
  description: 'Generate Add to Calendar links for Google Calendar events.',
  slug: 'add-to-calendar',
} as const;

export const Route = createFileRoute('/_tools/add-to-calendar/')({
  component: AddToCalendarPage,
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

function AddToCalendarPage() {
  const {
    form,
    linkResult,
    isValid,
    errors,
    handleCopyLink,
    handleCopyShareableLink,
    handleGenerateEmbed,
  } = useCalendarForm();

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardHeader title="Event Info" />
        <CardDescription className="px-6 pb-4">
          Enter the details for your calendar event.
        </CardDescription>
        <CardContent>
          <CalendarFormFields
            errors={errors}
            form={form}
            onSubmit={handleCopyLink}
          />

          {isValid && (
            <CalendarResultCards
              linkUrl={linkResult.url}
              onCopyLink={handleCopyLink}
              onCopyShareableLink={handleCopyShareableLink}
              onGenerateEmbed={handleGenerateEmbed}
            />
          )}
        </CardContent>
      </Card>

      <ToolHelp
        faq={[
          {
            question: 'Is my data safe?',
            answer:
              'Yes. All calendar links are generated locally in your browser. No data is sent to any server.',
          },
          {
            question: 'Which calendars are supported?',
            answer:
              "Currently only Google Calendar is supported. The link format follows Google's calendar event link specification.",
          },
        ]}
        howItWorks={{
          description:
            'Generate an "Add to Calendar" link for Google Calendar. Fill in the event details and click Generate to create a link that can be added to any calendar.',
          steps: [
            'Enter event title, description, and location',
            'Set start and end date/time',
            'Copy the generated link or embed button',
            'Share anywhere or add to your website',
          ],
        }}
      />
    </div>
  );
}
