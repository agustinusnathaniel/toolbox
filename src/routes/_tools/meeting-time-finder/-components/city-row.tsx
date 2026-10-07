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
  return 'bg-transparent';
}

function getStatusTextColor(
  status: 'core' | 'shoulder' | 'edge' | 'asleep'
): string {
  if (status === 'core') {
    return 'text-emerald-600';
  }
  if (status === 'shoulder') {
    return 'text-amber-600';
  }
  if (status === 'edge') {
    return 'text-orange-600';
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
      className="group grid grid-cols-[100px_1fr_80px] items-center gap-2 sm:grid-cols-[140px_1fr_100px]"
      key={city.id}
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-1">
          <span className="truncate font-medium text-sm">{city.name}</span>
          <button
            aria-label={`Remove ${city.name}`}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            onClick={() => onRemove(city.id)}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-muted-foreground">
            {offsetLabel}
          </span>
          <WorkHoursEditor city={city} onUpdate={onUpdateWorkHours} />
        </div>
      </div>

      <div className="grid grid-cols-24 gap-0">
        {HOURS.map((h) => {
          const s = getCityStatus(h, city);
          const isSelected = h === selectedHour;
          return (
            <div
              className={`h-6 rounded-sm ${getStatusColor(s)} ${
                isSelected ? 'ring-2 ring-foreground ring-offset-1' : ''
              } transition-colors`}
              key={`cell-${city.id}-${h}`}
            />
          );
        })}
      </div>

      <div className="text-right">
        <span className={`font-mono text-xs ${getStatusTextColor(status)}`}>
          {localTime}
        </span>
      </div>
    </div>
  );
}
