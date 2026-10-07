import { useCallback, useMemo, useState } from 'react';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  DEFAULT_CITY_IDS,
  getCityById,
} from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  findBestTime as computeBestTime,
  getLocalTimeLabel,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';
import {
  buildMeetingParams,
  parseMeetingParams,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder-params';
import { copyToClipboard } from '@/lib/utils/clipboard';

const STORAGE_KEY = 'meeting-time-finder:cities';
const DEFAULT_DURATION = 60;

function loadDefaultCities(): Array<City> {
  return DEFAULT_CITY_IDS.map((id) => getCityById(id)).filter(
    (c): c is City => c !== undefined
  );
}

function useCityActions(
  setCities: React.Dispatch<React.SetStateAction<Array<City>>>,
  trackAction: (action: string) => void
) {
  const addCity = useCallback(
    (city: City) => {
      setCities((prev) => {
        if (prev.some((c) => c.id === city.id)) {
          return prev;
        }
        return [...prev, city];
      });
      trackAction('add_city');
    },
    [setCities, trackAction]
  );

  const removeCity = useCallback(
    (cityId: string) => {
      setCities((prev) => prev.filter((c) => c.id !== cityId));
      trackAction('remove_city');
    },
    [setCities, trackAction]
  );

  const updateWorkHours = useCallback(
    (cityId: string, workStart: number, workEnd: number) => {
      setCities((prev) =>
        prev.map((c) => (c.id === cityId ? { ...c, workEnd, workStart } : c))
      );
      trackAction('update_work_hours');
    },
    [setCities, trackAction]
  );

  return { addCity, removeCity, updateWorkHours };
}

function useMeetingActions(
  cities: ReadonlyArray<City>,
  duration: number,
  selectedHour: number,
  setSelectedHour: React.Dispatch<React.SetStateAction<number>>,
  trackAction: (action: string) => void
) {
  const findBestTime = useCallback(() => {
    const best = computeBestTime(cities, duration);
    if (best) {
      setSelectedHour(best.startHour);
      trackAction('find_best_time');
    }
  }, [cities, duration, setSelectedHour, trackAction]);

  const copyTimes = useCallback(async () => {
    const lines = cities.map(
      (c) => `${c.name}: ${getLocalTimeLabel(selectedHour, c)}`
    );
    const text = `Meeting time: ${String(selectedHour).padStart(2, '0')}:00 UTC\n${lines.join('\n')}`;
    await copyToClipboard(text);
    trackAction('copy_times');
  }, [cities, selectedHour, trackAction]);

  const getCalendarUrl = useCallback(() => {
    const start = new Date();
    start.setUTCHours(selectedHour, 0, 0, 0);
    const end = new Date(start.getTime() + duration * 60_000);

    const params = new URLSearchParams({
      desc: `Meeting across ${cities.length} timezones`,
      end: end.toISOString(),
      start: start.toISOString(),
      title: 'Meeting',
    });

    const url = `/_tools/add-to-calendar/?${params.toString()}`;
    window.location.href = url;
    trackAction('add_to_calendar');
  }, [selectedHour, duration, cities.length, trackAction]);

  return { copyTimes, findBestTime, getCalendarUrl };
}

export function useMeetingPage(
  search: { cities?: string; duration?: string },
  trackAction: (action: string) => void
) {
  const urlParams = useMemo(() => parseMeetingParams(search), [search]);

  const [cities, setCities] = usePersistedState<Array<City>>(
    STORAGE_KEY,
    loadDefaultCities(),
    urlParams.cities.length > 0 ? urlParams.cities : undefined
  );

  const [duration, setDuration] = useState(
    urlParams.duration || DEFAULT_DURATION
  );
  const [selectedHour, setSelectedHour] = useState(14);

  const { addCity, removeCity, updateWorkHours } = useCityActions(
    setCities,
    trackAction
  );
  const { findBestTime, copyTimes, getCalendarUrl } = useMeetingActions(
    cities,
    duration,
    selectedHour,
    setSelectedHour,
    trackAction
  );

  const shareableParams = useMemo(
    () => buildMeetingParams(cities, duration),
    [cities, duration]
  );

  return {
    addCity,
    cities,
    copyTimes,
    duration,
    findBestTime,
    getCalendarUrl,
    removeCity,
    selectedHour,
    setDuration,
    setSelectedHour,
    shareableParams,
    updateWorkHours,
  };
}
