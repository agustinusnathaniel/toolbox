import { ChevronDownIcon } from '@heroicons/react/20/solid';

import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@/lib/components/ui/menu';
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

  return (
    <Menu>
      <MenuTrigger className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-primary-fg text-sm transition-opacity hover:opacity-90">
        <span className="tabular-nums">
          {formatHourInZone(selectedHour, referenceZone)}
        </span>
        <span className="font-sans text-xs opacity-80">
          {zoneLabel(referenceZone, cities)}
        </span>
        <ChevronDownIcon className="size-4 opacity-70" data-slot="chevron" />
      </MenuTrigger>
      <MenuContent
        onAction={(key) => {
          if (key === 'now') {
            onJumpToNow();
          } else {
            onReferenceChange(String(key));
          }
        }}
        placement="bottom end"
        popover={{ shouldFlip: false }}
        selectedKeys={[referenceZone]}
        selectionMode="single"
      >
        <MenuHeader>Show the strip in</MenuHeader>
        <MenuItem id="UTC" textValue="UTC">
          UTC
        </MenuItem>
        {cities.map((city) => (
          <MenuItem id={city.timezone} key={city.id} textValue={city.name}>
            {city.name}
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem id="now" textValue={`Jump to now ${nowLabel}`}>
          Jump to now — <span className="tabular-nums">{nowLabel}</span>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
