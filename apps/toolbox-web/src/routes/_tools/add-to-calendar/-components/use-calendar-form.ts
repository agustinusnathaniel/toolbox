import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  formatLocalDateTimeString,
  generateGoogleCalendarLink,
} from '@/lib/tools/add-to-calendar/adapters/calendar';

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

export type CalendarFormType = z.infer<typeof formSchema>;

const STORAGE_KEY = 'toolbox:add-to-calendar';

type PersistedCalendar = Pick<
  CalendarFormType,
  'title' | 'description' | 'location'
>;

const defaultPersisted: PersistedCalendar = {
  title: '',
  description: '',
  location: '',
};

export function useCalendarForm() {
  const [saved, setSaved] = usePersistedState(STORAGE_KEY, defaultPersisted);

  const form = useForm<CalendarFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...saved,
      start: formatLocalDateTimeString(),
      end: formatLocalDateTimeString(),
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setSaved({
        title: values.title ?? '',
        description: values.description ?? '',
        location: values.location ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSaved]);

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

  return {
    form,
    linkResult,
    isValid,
    errors,
    handleCopyLink,
    handleGenerateEmbed,
  };
}
