import { useCallback, useMemo, useState } from 'react';

import { CopyLinkButton } from '@/lib/components/copy-link-button';
import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/lib/components/ui/select';
import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import { findBestTime } from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

interface MeetingActionsProps {
  cities: ReadonlyArray<City>;
  duration: number;
  onAddToCalendar: () => void;
  onCopy: () => void;
  onDurationChange: (duration: number) => void;
  onFindBestTime: () => void;
  shareableParams: URLSearchParams;
  trackAction: (action: string) => void;
}

const DURATION_OPTIONS = [
  { id: '30', label: '30 min' },
  { id: '60', label: '1 hour' },
  { id: '120', label: '2 hours' },
  { id: '180', label: '3 hours' },
];

export function MeetingActions({
  cities,
  duration,
  onDurationChange,
  onFindBestTime,
  onCopy,
  onAddToCalendar,
  shareableParams,
  trackAction,
}: MeetingActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const handleCopyLink = useCopyShareableLink(
    () => shareableParams,
    trackAction
  );

  const bestTime = useMemo(
    () => findBestTime(cities, duration),
    [cities, duration]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
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

      {bestTime && (
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="font-medium text-sm">Best time: {bestTime.label}</div>
          <div className="text-muted-foreground text-xs">
            {Math.round(bestTime.score * 100)}% overlap across {cities.length}{' '}
            {cities.length === 1 ? 'city' : 'cities'}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button intent="primary" onPress={onFindBestTime} size="sm">
          Find Best Time
        </Button>
        <Button intent="outline" onPress={handleCopy} size="sm">
          {copied ? 'Copied!' : 'Copy Times'}
        </Button>
        <CopyLinkButton onPress={handleCopyLink} />
        <Button intent="outline" onPress={onAddToCalendar} size="sm">
          Add to Calendar
        </Button>
      </div>
    </div>
  );
}
