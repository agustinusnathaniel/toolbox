import { useState } from 'react';

import { Button } from '@/lib/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
      aria-label={ariaLabel}
      onSelectionChange={(key) => onChange(Number(key as string))}
      selectedKey={String(value)}
    >
      <SelectTrigger className="h-7 px-2 text-xs" id={id} />
      <SelectContent items={HOUR_OPTIONS}>
        {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
      </SelectContent>
    </Select>
  );
}

export function WorkHoursEditor({ city, onUpdate }: WorkHoursEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [start, setStart] = useState(city.workStart);
  const [end, setEnd] = useState(city.workEnd);

  const handleSave = () => {
    onUpdate(city.id, start, end);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        className="font-mono text-muted-foreground text-xs underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
        onClick={() => {
          setStart(city.workStart);
          setEnd(city.workEnd);
          setIsEditing(true);
        }}
        title="Click to edit working hours"
        type="button"
      >
        {city.workStart}–{city.workEnd}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
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
      <div className="flex items-center gap-1">
        <Button intent="primary" onPress={handleSave} size="xs">
          Save
        </Button>
        <Button intent="plain" onPress={() => setIsEditing(false)} size="xs">
          Cancel
        </Button>
      </div>
    </div>
  );
}
