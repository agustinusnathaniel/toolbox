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
    description: z.string().optional(),
    end: z.string().min(1, 'End date/time is required'),
    location: z.string().optional(),
    start: z.string().min(1, 'Start date/time is required'),
    title: z.string().min(1, 'Title is required'),
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
  description: '',
  location: '',
  title: '',
};

function buildDefaults(
  search: Record<string, unknown>,
  saved: PersistedCalendar
) {
  const defaultStart =
    (search.start as string | undefined) ?? formatLocalDateTimeString();
  const defaultEnd =
    (search.end as string | undefined) ??
    (() => {
      const d = new Date();
      d.setHours(d.getHours() + 1);
      return formatLocalDateTimeString(d);
    })();
  return {
    description: (search.desc as string | undefined) ?? saved.description,
    end: defaultEnd,
    location: (search.loc as string | undefined) ?? saved.location,
    start: defaultStart,
    title: (search.title as string | undefined) ?? saved.title,
  };
}

function usePersistedSync(
  form: ReturnType<typeof useForm<CalendarFormType>>,
  setSaved: (v: PersistedCalendar) => void
) {
  useEffect(() => {
    const sub = form.watch((values) => {
      setSaved({
        description: values.description ?? '',
        location: values.location ?? '',
        title: values.title ?? '',
      });
    });
    return () => sub.unsubscribe();
  }, [form, setSaved]);
}

function useCalendarLink(
  title: string,
  description: string | undefined,
  location: string | undefined,
  start: string,
  end: string
) {
  return useMemo(
    () =>
      generateGoogleCalendarLink({
        description: description || undefined,
        end,
        location: location || undefined,
        start,
        title: title || '',
      }),
    [title, description, location, start, end]
  );
}

export function useCalendarForm() {
  const search = useSearch({
    from: '/_tools/add-to-calendar/',
  } as never) as Record<string, unknown>;
  const navigate = useNavigate({ from: '/add-to-calendar/' } as never);
  const [saved, setSaved] = usePersistedState(STORAGE_KEY, defaultPersisted);
  const form = useForm<CalendarFormType>({
    defaultValues: buildDefaults(search, saved),
    resolver: zodResolver(formSchema),
  });
  usePersistedSync(form as never, setSaved);
  const [title, description, location, start, end] = form.watch([
    'title',
    'description',
    'location',
    'start',
    'end',
  ]);
  const linkResult = useCalendarLink(
    title ?? '',
    description,
    location,
    start ?? '',
    end ?? ''
  );
  const { isValid, errors } = form.formState;
  const handleCopyLink = () => copyToClipboard(linkResult.url, 'Copied Link');
  const handleGenerateEmbed = () => {
    const escaped = linkResult.url
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const embed = `<a href="${escaped}" target="_blank" rel="noopener noreferrer" style="border:1px solid black;padding:6px;border-radius:6px;text-decoration:none;color:white;font-weight:400;background-color:black;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;">Add to Google Calendar</a>`;
    return copyToClipboard(embed, 'Copied Embed Code');
  };
  const handleCopyShareableLink = () => {
    navigate({
      replace: true,
      search: ((prev: Record<string, unknown>) => ({
        ...(prev as Record<string, unknown>),
        ...buildCalendarSearchParams({
          description,
          end,
          location,
          start,
          title,
        }),
      })) as never,
    });
    return copyToClipboard(window.location.href, 'Copied Shareable Link');
  };
  return {
    errors,
    form,
    handleCopyLink,
    handleCopyShareableLink,
    handleGenerateEmbed,
    isValid,
    linkResult,
  };
}
