import { XMarkIcon } from '@heroicons/react/20/solid';

import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  getCityStatus,
  getCityStatusAtReferenceHour,
  getLocalTimeLabel,
  getTimezoneOffsetLabel,
  utcHourToReferenceHour,
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
  referenceZone: string;
  selectedHour: number;
}

export function CityRow({
  city,
  referenceZone,
  selectedHour,
  onRemove,
  onUpdateWorkHours,
}: CityRowProps) {
  const localTime = getLocalTimeLabel(selectedHour, city);
  const offsetLabel = getTimezoneOffsetLabel(city.timezone);
  const status = getCityStatus(selectedHour, city);
  const selectedColumn =
    Math.floor(utcHourToReferenceHour(selectedHour, referenceZone)) % 24;

  return (
    <div
      className="group flex flex-col gap-1 sm:grid sm:grid-cols-[var(--info)_1fr_var(--time)] sm:items-center sm:gap-x-2"
      key={city.id}
    >
      <div
        className="flex min-w-0 items-center justify-between gap-2 sm:block"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate font-medium text-sm">{city.name}</span>
          <button
            aria-label={`Remove ${city.name}`}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground sm:h-6 sm:w-6 sm:bg-transparent sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => onRemove(city.id)}
            type="button"
          >
            <XMarkIcon className="size-4 sm:size-3.5" />
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] sm:hidden">
          <span className="text-muted-foreground">{offsetLabel}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <WorkHoursEditor city={city} onUpdate={onUpdateWorkHours} />
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className={`tabular-nums ${getStatusTextColor(status)}`}>
            {localTime}
          </span>
        </div>
        <div className="mt-0.5 hidden items-center gap-1 font-mono text-[11px] text-muted-foreground sm:flex">
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
          const s = getCityStatusAtReferenceHour(city, h, referenceZone);
          return (
            <div
              className={`h-8 rounded-sm ${getStatusColor(s)} transition-[filter] hover:brightness-110${
                h === selectedColumn
                  ? 'outline outline-2 outline-foreground/70 outline-offset-[-2px]'
                  : ''
              }`}
              key={`cell-${city.id}-${h}`}
            />
          );
        })}
      </div>

      <span
        className={`hidden whitespace-nowrap text-right font-mono text-xs tabular-nums sm:block ${getStatusTextColor(status)}`}
      >
        {localTime}
      </span>
    </div>
  );
}
