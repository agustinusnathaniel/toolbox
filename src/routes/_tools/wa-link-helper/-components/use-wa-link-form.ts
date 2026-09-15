'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { buildWhatsAppLink } from '@/lib/tools/wa-link-helper/adapters/wa-link';

export const waLinkFormSchema = z.object({
  country_code: z.string().min(1, 'Please select a country'),
  phone_number: z.string().min(1, 'Please enter a phone number'),
  text: z.string().optional(),
});

export type WaLinkFormType = z.infer<typeof waLinkFormSchema>;

const STORAGE_KEY = 'toolbox:wa-link-helper';

const defaultFormValues: WaLinkFormType = {
  country_code: 'ID',
  phone_number: '',
  text: '',
};

interface WaLinkSearch {
  cc?: string;
  phone?: string;
  text?: string;
}

export function useWaLinkForm(search: WaLinkSearch) {
  const { trackComplete } = useToolTracking('wa-link-helper', 'WA Link Helper');
  const [saved, setSaved] = usePersistedState(STORAGE_KEY, defaultFormValues);

  const initialValues: WaLinkFormType = {
    country_code: search.cc ?? saved.country_code,
    phone_number: search.phone ?? saved.phone_number,
    text: search.text ?? saved.text,
  };

  const form = useForm<WaLinkFormType>({
    defaultValues: initialValues,
    resolver: zodResolver(waLinkFormSchema),
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      setSaved({
        country_code: values.country_code ?? '',
        phone_number: values.phone_number ?? '',
        text: values.text ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [form, setSaved]);

  const [countryCode, phoneNumber, text] = form.watch([
    'country_code',
    'phone_number',
    'text',
  ]);

  const { link, isValid: isPhoneValid } = useMemo(
    () => buildWhatsAppLink({ countryCode, phoneNumber, text }),
    [countryCode, phoneNumber, text]
  );

  useEffect(() => {
    if (link && isPhoneValid) {
      trackComplete(true);
    }
  }, [link, isPhoneValid, trackComplete]);

  return { countryCode, form, isPhoneValid, link, phoneNumber, text };
}
