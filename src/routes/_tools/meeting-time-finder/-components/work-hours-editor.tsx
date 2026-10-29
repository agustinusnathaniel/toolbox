import { useState } from 'react';

import { Button } from '@/lib/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/lib/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';

interface WorkHoursEditorProps {
  city: City;
  onUpdate: (cityId: string, workStart: number, workEnd: number) => void;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  id: String(h),
  label: `${String(h).padStart(2, '0')}:00`,
}));

function HourSelect({
  ariaLabel,
  id,
  onChange,
  value,
}: {
  ariaLabel: string;
  id: string;
  onChange: (hour: number) => void;
  value: number;
}) {
  return (
    <Select
      onValueChange={(key) => onChange(Number(key as string))}
      value={String(value)}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-7 px-2 text-xs"
        id={id}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOUR_OPTIONS.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function WorkHoursEditor({ city, onUpdate }: WorkHoursEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [start, setStart] = useState(city.workStart);
  const [end, setEnd] = useState(city.workEnd);

  const handleSave = () => {
    onUpdate(city.id, start, end);
    setIsOpen(false);
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        render={
          <Button
            aria-label={`Edit working hours for ${city.name}, currently ${city.workStart} to ${city.workEnd}`}
            className="h-auto min-h-8 min-w-8 justify-start px-1 font-mono text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground sm:min-h-0 sm:min-w-0"
            onClick={() => {
              setStart(city.workStart);
              setEnd(city.workEnd);
            }}
            variant="ghost"
          >
            {city.workStart}–{city.workEnd}
          </Button>
        }
      />
      <PopoverContent align="start" side="bottom">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <HourSelect
              ariaLabel={`Work start hour for ${city.name}`}
              id={`work-start-${city.id}`}
              onChange={setStart}
              value={start}
            />
            <span className="text-muted-foreground text-xs">–</span>
            <HourSelect
              ariaLabel={`Work end hour for ${city.name}`}
              id={`work-end-${city.id}`}
              onChange={setEnd}
              value={end}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="xs" variant="default">
              Save
            </Button>
            <Button onClick={() => setIsOpen(false)} size="xs" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
