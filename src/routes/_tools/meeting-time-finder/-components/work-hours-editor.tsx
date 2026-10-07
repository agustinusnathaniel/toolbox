import { useState } from 'react';

import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';

interface WorkHoursEditorProps {
  city: City;
  onUpdate: (cityId: string, workStart: number, workEnd: number) => void;
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
        <select
          aria-label="Work start hour"
          className="w-16 rounded border border-input bg-background px-1 py-0.5 text-xs"
          onChange={(e) => setStart(Number(e.target.value))}
          value={start}
        >
          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
            <option key={`hour-${h}`} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
        <span className="text-muted-foreground text-xs">–</span>
        <select
          aria-label="Work end hour"
          className="w-16 rounded border border-input bg-background px-1 py-0.5 text-xs"
          onChange={(e) => setEnd(Number(e.target.value))}
          value={end}
        >
          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="font-medium text-primary text-xs hover:text-primary/80"
          onClick={handleSave}
          type="button"
        >
          Save
        </button>
        <button
          className="text-muted-foreground text-xs hover:text-foreground"
          onClick={() => setIsEditing(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
