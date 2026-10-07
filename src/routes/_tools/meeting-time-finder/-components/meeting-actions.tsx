import { useCallback, useState } from 'react';

import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import { findBestTime } from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

interface MeetingActionsProps {
  cities: ReadonlyArray<City>;
  duration: number;
  onAddToCalendar: () => void;
  onCopy: () => void;
  onDurationChange: (duration: number) => void;
  onFindBestTime: () => void;
}

const DURATION_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

export function MeetingActions({
  cities,
  duration,
  onDurationChange,
  onFindBestTime,
  onCopy,
  onAddToCalendar,
}: MeetingActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  const bestTime = findBestTime(cities, duration);

  return (
    <div className="flex flex-col gap-4">
      {/* Duration selector */}
      <div className="flex items-center gap-2">
        <label className="font-medium text-sm" htmlFor="duration">
          Duration:
        </label>
        <select
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
          id="duration"
          onChange={(e) => onDurationChange(Number(e.target.value))}
          value={duration}
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Best time result */}
      {bestTime && (
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="font-medium text-sm">Best time: {bestTime.label}</div>
          <div className="text-muted-foreground text-xs">
            {Math.round(bestTime.score * 100)}% overlap across {cities.length}{' '}
            {cities.length === 1 ? 'city' : 'cities'}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-fg text-sm transition-colors hover:bg-primary/90"
          onClick={onFindBestTime}
          type="button"
        >
          Find Best Time
        </button>
        <button
          className="rounded-lg border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
          onClick={handleCopy}
          type="button"
        >
          {copied ? 'Copied!' : 'Copy Times'}
        </button>
        <button
          className="rounded-lg border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent"
          onClick={onAddToCalendar}
          type="button"
        >
          Add to Calendar
        </button>
      </div>
    </div>
  );
}
