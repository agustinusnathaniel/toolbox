'use client';

import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
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
import { meta } from './-meta';

const searchSchema = z.object({
  desc: z.string().optional(),
  end: z.string().optional(),
  loc: z.string().optional(),
  start: z.string().optional(),
  title: z.string().optional(),
});

export const Route = createFileRoute('/_tools/add-to-calendar/')({
  component: AddToCalendarPage,
  head: () => ({
    meta: [
      { title: meta.pageTitle },
      { content: meta.description, name: 'description' },
      { content: meta.pageTitle, property: 'og:title' },
      { content: meta.description, property: 'og:description' },
      { content: 'website', property: 'og:type' },
    ],
  }),
  staticData: {
    meta,
  },
  validateSearch: searchSchema,
});

function AddToCalendarPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'add-to-calendar',
    'Add to Calendar'
  );
  const {
    form,
    linkResult,
    isValid,
    errors,
    handleCopyLink: rawCopyLink,
    handleCopyShareableLink: rawShareable,
    handleGenerateEmbed: rawEmbed,
  } = useCalendarForm();

  const handleCopyLink = () => {
    trackAction('copy_link');
    rawCopyLink();
  };
  const handleCopyShareableLink = () => {
    trackAction('copy_shareable');
    rawShareable();
  };
  const handleGenerateEmbed = () => {
    trackAction('generate_embed');
    rawEmbed();
  };

  useEffect(() => {
    if (isValid && linkResult) {
      trackComplete(true);
    }
  }, [isValid, linkResult, trackComplete]);

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
            answer:
              'Yes. All calendar links are generated locally in your browser. No data is sent to any server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              "Currently only Google Calendar is supported. The link format follows Google's calendar event link specification.",
            question: 'Which calendars are supported?',
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
