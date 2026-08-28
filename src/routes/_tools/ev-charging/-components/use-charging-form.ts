import { zodResolver } from '@hookform/resolvers/zod';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import {
  buildChargingSearchParams,
  CHARGER_DEFAULT_POWER,
  type ChargerType,
  calculateChargingEstimate,
} from '@/lib/tools/ev-charging-estimator/adapters/ev-charging';
import { copyToClipboard } from '@/lib/utils/clipboard';

import {
  defaultValues,
  type PersistedValues,
  STORAGE_KEY,
} from './charging-form-constants';
import type { FormType } from './charging-form-schema';
import { allRequiredFields, formSchema } from './charging-form-schema';

function buildFormDefaults(
  search: Record<string, unknown>,
  saved: PersistedValues
): FormType {
  return {
    calibrationFactor:
      (search.cal as number | undefined) ??
      saved.calibrationFactor ??
      (defaultValues.calibrationFactor as number),
    chargerType:
      (search.type as ChargerType | undefined) ??
      saved.chargerType ??
      (defaultValues.chargerType as ChargerType),
    chargingPower:
      (search.power as number | undefined) ??
      saved.chargingPower ??
      defaultValues.chargingPower,
    electricityRate:
      (search.rate as number | undefined) ??
      saved.electricityRate ??
      defaultValues.electricityRate,
    endSOC:
      (search.end as number | undefined) ??
      saved.endSOC ??
      (defaultValues.endSOC as number),
    startSOC:
      (search.start as number | undefined) ??
      saved.startSOC ??
      (defaultValues.startSOC as number),
    totalCapacity:
      (search.cap as number | undefined) ??
      saved.totalCapacity ??
      (defaultValues.totalCapacity as number),
    usablePercent:
      (search.usable as number | undefined) ??
      saved.usablePercent ??
      (defaultValues.usablePercent as number),
  };
}

function useChargingResult(
  watchedValues: FormType,
  effectiveChargingPower: number | undefined
) {
  return useMemo(() => {
    if (
      !allRequiredFields(watchedValues) ||
      watchedValues.endSOC < watchedValues.startSOC
    ) {
      return null;
    }
    return calculateChargingEstimate({
      calibrationFactor: watchedValues.calibrationFactor,
      chargerType: watchedValues.chargerType as ChargerType,
      chargingPower: effectiveChargingPower,
      electricityRate: watchedValues.electricityRate,
      endSOC: watchedValues.endSOC,
      startSOC: watchedValues.startSOC,
      totalCapacity: watchedValues.totalCapacity,
      usablePercent: watchedValues.usablePercent,
    });
  }, [watchedValues, effectiveChargingPower]);
}

function usePersistedSync(
  watchedValues: FormType,
  setSaved: (v: PersistedValues) => void
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setSaved({
        calibrationFactor: watchedValues.calibrationFactor,
        chargerType: watchedValues.chargerType as ChargerType,
        chargingPower: watchedValues.chargingPower ?? undefined,
        electricityRate: watchedValues.electricityRate ?? undefined,
        endSOC: watchedValues.endSOC,
        startSOC: watchedValues.startSOC,
        totalCapacity: watchedValues.totalCapacity,
        usablePercent: watchedValues.usablePercent,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [watchedValues, setSaved]);
}

export function useChargingForm(onComplete: (success: boolean) => void) {
  const search = useSearch({ from: '/_tools/ev-charging/' } as never) as Record<
    string,
    unknown
  >;
  const [saved, setSaved] = usePersistedState<PersistedValues>(
    STORAGE_KEY,
    defaultValues
  );

  const form = useForm<FormType>({
    defaultValues: buildFormDefaults(search, saved),
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const watchedValues = form.watch();
  const effectiveChargingPower =
    watchedValues.chargingPower ??
    CHARGER_DEFAULT_POWER[watchedValues.chargerType as ChargerType];

  // biome-ignore lint/correctness/useExhaustiveDependencies: startSOC triggers endSOC refinement
  useEffect(() => {
    form.trigger('endSOC');
  }, [watchedValues.startSOC, form]);

  usePersistedSync(watchedValues, setSaved);
  const result = useChargingResult(watchedValues, effectiveChargingPower);

  useEffect(() => {
    if (result) {
      onComplete(true);
    }
  }, [result, onComplete]);

  const handleCopyShareableLink = async (onTrack: (action: string) => void) => {
    const params = buildChargingSearchParams(watchedValues);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    if (await copyToClipboard(url, 'Copied Shareable Link')) {
      onTrack('copy_shareable');
    }
  };

  return {
    effectiveChargingPower,
    form,
    handleCopyShareableLink,
    result,
    watchedValues,
  };
}
