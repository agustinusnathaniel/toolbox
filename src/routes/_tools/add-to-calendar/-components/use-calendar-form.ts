import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  buildCalendarSearchParams,
  formatLocalDateTimeString,
  generateGoogleCalendarLink,
} from '@/lib/tools/add-to-calendar/adapters/calendar';
import { copyToClipboard } from '@/lib/utils/clipboard';

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
  const search = useSearch({ from: '/_tools/add-to-calendar/' });
  const navigate = useNavigate({ from: '/add-to-calendar/' });
  const [saved, setSaved] = usePersistedState(STORAGE_KEY, defaultPersisted);

  const defaultStart = search.start ?? formatLocalDateTimeString();
  const defaultEnd =
    search.end ??
    (() => {
      const d = new Date();
      d.setHours(d.getHours() + 1);
      return formatLocalDateTimeString(d);
    })();

  const form = useForm<CalendarFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: search.title ?? saved.title,
      description: search.desc ?? saved.description,
      location: search.loc ?? saved.location,
      start: defaultStart,
      end: defaultEnd,
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
    copyToClipboard(linkResult.url, 'Copied Link');
  };

  const handleGenerateEmbed = () => {
    const escapedUrl = linkResult.url
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const embed = `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" style="border:1px solid black;padding:6px;border-radius:6px;text-decoration:none;color:white;font-weight:400;background-color:black;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;">Add to Google Calendar</a>`;
    copyToClipboard(embed, 'Copied Embed Code');
  };

  const handleCopyShareableLink = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...buildCalendarSearchParams({
          title,
          description,
          location,
          start,
          end,
        }),
      }),
      replace: true,
    });
    const url = window.location.href;
    copyToClipboard(url, 'Copied Shareable Link');
  };

  return {
    form,
    linkResult,
    isValid,
    errors,
    handleCopyLink,
    handleCopyShareableLink,
    handleGenerateEmbed,
  };
}
