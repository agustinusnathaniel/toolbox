import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
        <Label htmlFor="meeting-duration">Duration</Label>
        <Select
          aria-label="Meeting duration"
          onSelectionChange={(key) => onDurationChange(Number(key as string))}
          selectedKey={String(duration)}
        >
          <SelectTrigger id="meeting-duration" />
          <SelectContent items={DURATION_OPTIONS}>
            {(option) => <SelectItem id={option.id}>{option.label}</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <Button intent="outline" onPress={onAddToCalendar} size="sm">
        Add to Calendar
      </Button>
    </div>
  );
}
