import { useMemo } from 'react';

import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import {
  findBestTime,
  getAxisLabel,
  getOutlierSummary,
  getOverallScore,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

import { CityRow } from './city-row';
import { CitySearch } from './city-search';
import { StripAnchor } from './strip-anchor';
import { useTimelineDrag } from './use-timeline-drag';

interface MeetingTimelineProps {
  cities: ReadonlyArray<City>;
  duration: number;
  onAddCity: (city: City) => void;
  onHourChange: (hour: number) => void;
  onJumpToNow: () => void;
  onReferenceChange: (timezone: string) => void;
  onRemoveCity: (cityId: string) => void;
  onUpdateWorkHours: (
    cityId: string,
    workStart: number,
    workEnd: number
  ) => void;
  referenceZone: string;
  selectedHour: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getScoreColor(score: number): string {
  if (score >= 0.8) {
    return 'bg-emerald-500/30';
  }
  if (score >= 0.5) {
    return 'bg-emerald-500/20';
  }
  if (score >= 0.3) {
    return 'bg-amber-500/20';
  }
  if (score >= 0.1) {
    return 'bg-orange-500/15';
  }
  return 'bg-transparent';
}

function TimelineHeader({
  cities,
  onJumpToNow,
  onReferenceChange,
  referenceZone,
  selectedHour,
}: {
  cities: ReadonlyArray<City>;
  onJumpToNow: () => void;
  onReferenceChange: (timezone: string) => void;
  referenceZone: string;
  selectedHour: number;
}) {
  const outlier = getOutlierSummary(selectedHour, cities);
  const score = getOverallScore(selectedHour, cities);
  const scorePercent = Math.round(score * 100);
  const firstOutlier = outlier.outliers[0];
  const extraOutliers = outlier.outliers.length - 1;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="font-semibold text-lg">Timeline</h2>
          <p className="text-muted-foreground text-sm">
            Drag to explore times across timezones
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StripAnchor
            cities={cities}
            onJumpToNow={onJumpToNow}
            onReferenceChange={onReferenceChange}
            referenceZone={referenceZone}
            selectedHour={selectedHour}
          />
          <div className="text-muted-foreground text-xs">
            {outlier.inHours} of {outlier.total} in hours
            {firstOutlier && (
              <>
                {' · '}
                {firstOutlier.relation} in {firstOutlier.name}
                {extraOutliers > 0 && ` +${extraOutliers} more`}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Score:</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <span className="text-muted-foreground text-xs">{scorePercent}%</span>
      </div>
    </>
  );
}

function TimelineContent({
  cities,
  duration,
  onHourChange,
  referenceZone,
  selectedHour,
  onRemoveCity,
  onUpdateWorkHours,
}: {
  cities: ReadonlyArray<City>;
  duration: number;
  onHourChange: (hour: number) => void;
  referenceZone: string;
  selectedHour: number;
  onRemoveCity: (cityId: string) => void;
  onUpdateWorkHours: (
    cityId: string,
    workStart: number,
    workEnd: number
  ) => void;
}) {
  const { timelineRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useTimelineDrag(onHourChange);

  return (
    <div className="overflow-x-auto pb-2">
      <div
        aria-label="Meeting time selector"
        aria-valuemax={23}
        aria-valuemin={0}
        aria-valuenow={selectedHour}
        className="cursor-crosshair touch-none select-none"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onHourChange((selectedHour - 1 + 24) % 24);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onHourChange((selectedHour + 1) % 24);
          }
        }}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={timelineRef}
        role="slider"
        tabIndex={0}
      >
        <div
          className="mb-1 grid gap-px"
          style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
        >
          {HOURS.map((h) => (
            <div
              className={`text-center font-mono text-[10px] tabular-nums ${
                h % 3 === 0 ? 'text-foreground' : 'text-muted-foreground/50'
              }`}
              key={`label-${h}`}
            >
              {h % 3 === 0 ? getAxisLabel(h, referenceZone) : ''}
            </div>
          ))}
        </div>

        <div
          className="mb-1 grid gap-px"
          style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
        >
          {HOURS.map((h) => {
            const s = getOverallScore(h, cities);
            return (
              <div
                className={`h-1 rounded-sm ${getScoreColor(s)}`}
                key={`score-${h}`}
              />
            );
          })}
        </div>

        <div className="relative">
          <div className="flex flex-col gap-1">
            {cities.map((city) => (
              <CityRow
                city={city}
                key={city.id}
                onRemove={onRemoveCity}
                onUpdateWorkHours={onUpdateWorkHours}
                selectedHour={selectedHour}
              />
            ))}
          </div>
          <BestTimeBand cities={cities} duration={duration} />
        </div>
      </div>
    </div>
  );
}

/**
 * Best-time highlight band, aligned exactly to the hour grid.
 * The grid uses 24 columns with 1px gaps, so plain % positioning would
 * drift by up to 23px. CSS calc accounts for the gaps:
 * left edge of hour h = h * ((100% - 23px) / 24) + h * 1px.
 */
function BestTimeBand({
  cities,
  duration,
}: {
  cities: ReadonlyArray<City>;
  duration: number;
}) {
  const bestTime = useMemo(
    () => findBestTime(cities, duration),
    [cities, duration]
  );
  if (!bestTime) {
    return null;
  }
  const bestStart = bestTime.startHour;
  const bestDurationHours = Math.max(1, Math.ceil(duration / 60));
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 bottom-0 border-emerald-500/50 border-x-2 bg-emerald-500/10"
      style={{
        left: `calc((100% - 23px) * ${bestStart} / 24 + ${bestStart}px)`,
        width: `calc((100% - 23px) * ${bestDurationHours} / 24 + ${bestDurationHours - 1}px)`,
      }}
    />
  );
}

function TimelineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-emerald-500/80" />
        <span className="text-muted-foreground">Core hours</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-amber-500/60" />
        <span className="text-muted-foreground">Shoulder</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-orange-500/40" />
        <span className="text-muted-foreground">Edge</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-neutral-400" />
        <span className="text-muted-foreground">Asleep</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-emerald-500/10 ring-2 ring-emerald-500/50 ring-inset" />
        <span className="text-muted-foreground">Best time</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-sm bg-muted outline outline-2 outline-foreground/70 outline-offset-[-2px]" />
        <span className="text-muted-foreground">Selected</span>
      </div>
    </div>
  );
}

export function MeetingTimeline({
  cities,
  duration,
  selectedHour,
  onHourChange,
  onJumpToNow,
  onReferenceChange,
  onRemoveCity,
  onUpdateWorkHours,
  onAddCity,
  referenceZone,
}: MeetingTimelineProps) {
  const existingIds = new Set(cities.map((c) => c.id));

  return (
    <div className="flex flex-col gap-4">
      <TimelineHeader
        cities={cities}
        onJumpToNow={onJumpToNow}
        onReferenceChange={onReferenceChange}
        referenceZone={referenceZone}
        selectedHour={selectedHour}
      />
      <TimelineContent
        cities={cities}
        duration={duration}
        onHourChange={onHourChange}
        onRemoveCity={onRemoveCity}
        onUpdateWorkHours={onUpdateWorkHours}
        referenceZone={referenceZone}
        selectedHour={selectedHour}
      />
      <div className="flex items-center gap-2">
        <CitySearch existingIds={existingIds} onAdd={onAddCity} />
      </div>
      <TimelineLegend />
    </div>
  );
}
