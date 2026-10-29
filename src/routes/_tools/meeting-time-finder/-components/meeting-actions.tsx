import { Button } from '@/lib/components/ui/button';
import { FieldLabel } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';

interface MeetingActionsProps {
  duration: number;
  onAddToCalendar: () => void;
  onDurationChange: (duration: number) => void;
}

const DURATION_OPTIONS = [
  { id: '30', label: '30 min' },
  { id: '60', label: '1 hour' },
  { id: '120', label: '2 hours' },
  { id: '180', label: '3 hours' },
];

export function MeetingActions({
  duration,
  onDurationChange,
  onAddToCalendar,
}: MeetingActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <FieldLabel htmlFor="meeting-duration">Duration</FieldLabel>
        <Select
          onValueChange={(key) => onDurationChange(Number(key as string))}
          value={String(duration)}
        >
          <SelectTrigger aria-label="Select option">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAddToCalendar} size="sm" variant="outline">
        Add to Calendar
      </Button>
    </div>
  );
}
