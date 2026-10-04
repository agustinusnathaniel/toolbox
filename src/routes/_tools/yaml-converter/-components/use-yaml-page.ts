'use client';

import { useTransformPage } from '@/lib/hooks/use-transform-page';
import {
  buildYamlParams,
  buildYamlStateFromSearch,
} from '@/lib/tools/yaml-converter/adapters/yaml-params';

import { useYamlConverter } from './use-yaml-converter';

export function useYamlPage(
  search: Parameters<typeof buildYamlStateFromSearch>[0],
  trackAction: (a: string) => void
) {
  return useTransformPage<
    Parameters<typeof buildYamlStateFromSearch>[0],
    Parameters<typeof buildYamlParams>[1]
  >(search, trackAction, {
    buildParams: (state) => buildYamlParams(state.input, state.mode),
    buildStateFromSearch: buildYamlStateFromSearch,
    useConverter: useYamlConverter,
  });
}
