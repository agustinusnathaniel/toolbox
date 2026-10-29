import { RiArrowDownSLine } from '@remixicon/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/components/ui/dropdown-menu';
import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  formatHourInZone,
  getCurrentTimeLabel,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

interface StripAnchorProps {
  cities: ReadonlyArray<City>;
  onJumpToNow: () => void;
  onReferenceChange: (timezone: string) => void;
  referenceZone: string;
  selectedHour: number;
}

function zoneLabel(referenceZone: string, cities: ReadonlyArray<City>): string {
  if (referenceZone === 'UTC') {
    return 'UTC';
  }
  return cities.find((c) => c.timezone === referenceZone)?.name ?? 'UTC';
}

export function StripAnchor({
  cities,
  onJumpToNow,
  onReferenceChange,
  referenceZone,
  selectedHour,
}: StripAnchorProps) {
  const nowLabel = getCurrentTimeLabel(referenceZone);

  const handleSelect = (timezone: string) => {
    if (timezone === 'now') {
      onJumpToNow();
    } else {
      onReferenceChange(timezone);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex w-auto min-w-36 max-w-56 items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-primary-foreground text-sm transition-opacity hover:opacity-90">
        <span className="shrink-0 tabular-nums">
          {formatHourInZone(selectedHour, referenceZone)}
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-sans text-xs opacity-80">
          {zoneLabel(referenceZone, cities)}
        </span>
        <RiArrowDownSLine aria-hidden="true" className="size-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuLabel>View in timezone</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleSelect('UTC')}>
            UTC
          </DropdownMenuItem>
          {cities.map((city) => (
            <DropdownMenuItem
              key={city.id}
              onClick={() => handleSelect(city.timezone)}
            >
              {city.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSelect('now')}>
          Jump to now — <span className="tabular-nums">{nowLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
