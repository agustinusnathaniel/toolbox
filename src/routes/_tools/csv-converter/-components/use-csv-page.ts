'use client';

import { useTransformPage } from '@/lib/hooks/use-transform-page';
import {
  buildCsvParams,
  buildCsvStateFromSearch,
} from '@/lib/tools/csv-converter/adapters/csv-params';

import { useCsvConverter } from './use-csv-converter';

export function useCsvPage(
  search: Parameters<typeof buildCsvStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  return useTransformPage(search, trackAction, {
    buildParams: buildCsvParams,
    buildStateFromSearch: buildCsvStateFromSearch,
    useConverter: useCsvConverter,
  });
}
