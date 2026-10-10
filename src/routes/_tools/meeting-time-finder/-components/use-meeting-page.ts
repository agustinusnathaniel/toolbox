import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { formatLocalDateTimeString } from '@/lib/tools/add-to-calendar/adapters/calendar';
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
const DURATION_KEY = 'meeting-time-finder:duration';
const HOUR_KEY = 'meeting-time-finder:hour';
const REFERENCE_KEY = 'meeting-time-finder:reference';
const DEFAULT_DURATION = 60;

function currentUtcHour(): number {
  return new Date().getUTCHours();
}

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

function useReferenceZone(
  cities: ReadonlyArray<City>,
  setSelectedHour: React.Dispatch<React.SetStateAction<number>>,
  trackAction: (action: string) => void
) {
  const [storedReference, setReferenceZone] = usePersistedState<string>(
    REFERENCE_KEY,
    'UTC'
  );

  // The strip zone must be UTC or one of the added cities. A stored zone
  // whose city was removed falls back to UTC instead of rendering garbage.
  const referenceZone =
    storedReference === 'UTC' ||
    cities.some((c) => c.timezone === storedReference)
      ? storedReference
      : 'UTC';

  const jumpToNow = useCallback(() => {
    setSelectedHour(currentUtcHour());
    trackAction('jump_to_now');
  }, [setSelectedHour, trackAction]);

  return { jumpToNow, referenceZone, setReferenceZone };
}

function useMeetingActions(
  cities: ReadonlyArray<City>,
  duration: number,
  selectedHour: number,
  setSelectedHour: React.Dispatch<React.SetStateAction<number>>,
  trackAction: (action: string) => void
) {
  const navigate = useNavigate();

  const findBestTime = useCallback(() => {
    const best = computeBestTime(cities, duration);
    if (best) {
      setSelectedHour(best.startHour);
      trackAction('find_best_time');
    }
  }, [cities, duration, setSelectedHour, trackAction]);

  const copyTimes = useCallback(async () => {
    const windowHours = Math.max(1, Math.ceil(duration / 60));
    const endHour = (selectedHour + windowHours) % 24;
    const lines = cities.map(
      (c) => `${c.name}: ${getLocalTimeLabel(selectedHour, c)}`
    );
    const text = `Meeting time (${duration} min): ${String(selectedHour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00 UTC\n${lines.join('\n')}`;
    await copyToClipboard(text);
    trackAction('copy_times');
  }, [cities, duration, selectedHour, trackAction]);

  const getCalendarUrl = useCallback(() => {
    const start = new Date();
    start.setUTCHours(selectedHour, 0, 0, 0);
    const end = new Date(start.getTime() + duration * 60_000);

    trackAction('add_to_calendar');
    navigate({
      search: {
        desc: `Meeting across ${cities.length} timezones`,
        end: formatLocalDateTimeString(end),
        start: formatLocalDateTimeString(start),
        title: 'Meeting',
      },
      to: '/add-to-calendar',
    });
  }, [selectedHour, duration, cities.length, navigate, trackAction]);

  const shareableParams = useMemo(
    () => buildMeetingParams(cities, duration, selectedHour),
    [cities, duration, selectedHour]
  );

  return { copyTimes, findBestTime, getCalendarUrl, shareableParams };
}

export function useMeetingPage(
  search: { cities?: string; duration?: string; hour?: string },
  trackAction: (action: string) => void
) {
  const urlParams = useMemo(() => parseMeetingParams(search), [search]);

  const [cities, setCities] = usePersistedState<Array<City>>(
    STORAGE_KEY,
    loadDefaultCities(),
    urlParams.cities.length > 0 ? urlParams.cities : undefined
  );

  const [duration, setDuration] = usePersistedState<number>(
    DURATION_KEY,
    DEFAULT_DURATION,
    search.duration === undefined ? undefined : urlParams.duration
  );

  const [selectedHour, setSelectedHour] = usePersistedState<number>(
    HOUR_KEY,
    currentUtcHour(),
    search.hour === undefined || urlParams.hour === null
      ? undefined
      : urlParams.hour
  );

  const { jumpToNow, referenceZone, setReferenceZone } = useReferenceZone(
    cities,
    setSelectedHour,
    trackAction
  );

  const { addCity, removeCity, updateWorkHours } = useCityActions(
    setCities,
    trackAction
  );
  const { findBestTime, copyTimes, getCalendarUrl, shareableParams } =
    useMeetingActions(
      cities,
      duration,
      selectedHour,
      setSelectedHour,
      trackAction
    );

  return {
    addCity,
    cities,
    copyTimes,
    duration,
    findBestTime,
    getCalendarUrl,
    jumpToNow,
    referenceZone,
    removeCity,
    selectedHour,
    setDuration,
    setReferenceZone,
    setSelectedHour,
    shareableParams,
    updateWorkHours,
  };
}
