import { XMarkIcon } from '@heroicons/react/20/solid';

import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  getCityStatus,
  getLocalTimeLabel,
  getTimezoneOffsetLabel,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

import { WorkHoursEditor } from './work-hours-editor';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getStatusColor(
  status: 'core' | 'shoulder' | 'edge' | 'asleep'
): string {
  if (status === 'core') {
    return 'bg-emerald-500/80';
  }
  if (status === 'shoulder') {
    return 'bg-amber-500/60';
  }
  if (status === 'edge') {
    return 'bg-orange-500/40';
  }
  return 'bg-neutral-400';
}

function getStatusTextColor(
  status: 'core' | 'shoulder' | 'edge' | 'asleep'
): string {
  if (status === 'core') {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (status === 'shoulder') {
    return 'text-amber-600 dark:text-amber-400';
  }
  if (status === 'edge') {
    return 'text-orange-600 dark:text-orange-400';
  }
  return 'text-muted-foreground';
}

interface CityRowProps {
  city: City;
  onRemove: (cityId: string) => void;
  onUpdateWorkHours: (
    cityId: string,
    workStart: number,
    workEnd: number
  ) => void;
  selectedHour: number;
}

export function CityRow({
  city,
  selectedHour,
  onRemove,
  onUpdateWorkHours,
}: CityRowProps) {
  const localTime = getLocalTimeLabel(selectedHour, city);
  const offsetLabel = getTimezoneOffsetLabel(city.timezone);
  const status = getCityStatus(selectedHour, city);

  return (
    <div
      className="grid grid-cols-[var(--info)_1fr_var(--time)] items-center gap-x-2"
      key={city.id}
    >
      <div className="group min-w-0">
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate font-medium text-sm">{city.name}</span>
          <button
            aria-label={`Remove ${city.name}`}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground sm:h-6 sm:w-6 sm:bg-transparent sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => onRemove(city.id)}
            type="button"
          >
            <XMarkIcon className="size-4 sm:size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <span className="shrink-0">{offsetLabel}</span>
          <span aria-hidden="true">·</span>
          <WorkHoursEditor city={city} onUpdate={onUpdateWorkHours} />
        </div>
      </div>

      <div
        className="grid min-w-0 gap-px"
        style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
      >
        {HOURS.map((h) => {
          const s = getCityStatus(h, city);
          return (
            <div
              className={`h-8 rounded-sm ${getStatusColor(s)} transition-[filter] hover:brightness-110${
                h === selectedHour
                  ? 'outline outline-2 outline-foreground/70 outline-offset-[-2px]'
                  : ''
              }`}
              key={`cell-${city.id}-${h}`}
            />
          );
        })}
      </div>

      <span
        className={`whitespace-nowrap text-right font-mono text-[10px] tabular-nums sm:text-xs ${getStatusTextColor(status)}`}
      >
        {localTime}
      </span>
    </div>
  );
}
