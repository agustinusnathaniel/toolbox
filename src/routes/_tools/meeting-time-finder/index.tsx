'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { ToolHelp } from '@/lib/components/tool-help';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import { MeetingActions } from './-components/meeting-actions';
import { MeetingTimeline } from './-components/meeting-timeline';
import { useMeetingPage } from './-components/use-meeting-page';
import { meta } from './-meta';

const searchSchema = z.object({
  cities: z.string().optional(),
  duration: z.string().optional(),
  hour: z.string().optional(),
});

export const Route = createFileRoute('/_tools/meeting-time-finder/')({
  component: MeetingTimeFinderPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function MeetingTimeFinderPage() {
  const { trackAction } = useToolTracking(
    'meeting-time-finder',
    'Meeting Time Finder'
  );
  const search = useSearch({ from: '/_tools/meeting-time-finder/' });
  const page = useMeetingPage(search, trackAction);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[90%] md:max-w-4xl">
      <MeetingTimeline
        cities={page.cities}
        duration={page.duration}
        onAddCity={page.addCity}
        onHourChange={page.setSelectedHour}
        onJumpToNow={page.jumpToNow}
        onReferenceChange={page.setReferenceZone}
        onRemoveCity={page.removeCity}
        onUpdateWorkHours={page.updateWorkHours}
        referenceZone={page.referenceZone}
        selectedHour={page.selectedHour}
      />

      <MeetingActions
        cities={page.cities}
        duration={page.duration}
        onAddToCalendar={page.getCalendarUrl}
        onCopy={page.copyTimes}
        onDurationChange={page.setDuration}
        onFindBestTime={page.findBestTime}
        shareableParams={page.shareableParams}
        trackAction={trackAction}
      />

      <ToolHelp
        faq={[
          {
            answer:
              'Yes. All calculations happen in your browser. Your city list and preferences are stored in localStorage and never sent to a server.',
            question: 'Is my data safe?',
          },
          {
            answer:
              'Click on the working hours label (e.g. "9–17") to customize when each city is available.',
            question: 'How do I set custom working hours?',
          },
          {
            answer:
              'Use the duration selector to choose your meeting length, then click "Find Best Time". The tool scores every possible start time and picks the one where the most cities are within their working hours.',
            question: 'How is the best time calculated?',
          },
        ]}
        howItWorks={{
          description:
            'Find a meeting time that works across timezones. Add cities, set their working hours, and drag across the timeline to explore times.',
          steps: [
            'Add cities using the search box',
            'Adjust working hours per city if needed',
            'Drag across the timeline or click "Find Best Time"',
            'Copy the times or add to your calendar',
          ],
        }}
      />
    </div>
  );
}
