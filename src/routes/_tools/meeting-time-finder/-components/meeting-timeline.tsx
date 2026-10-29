import { useMemo } from 'react';

import { Button } from '@/lib/components/ui/button';
import type { City } from '@/lib/tools/meeting-time-finder/adapters/cities';
import type { BestTimeResult } from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';
import {
  findBestTime,
  formatHourInZone,
  getOutlierSummary,
  getOverallScore,
  getOverallScoreAtReferenceHour,
  referenceHourToUtcHour,
  utcHourToReferenceHour,
} from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

import { CityRow } from './city-row';
import { CitySearch } from './city-search';
import { StripAnchor } from './strip-anchor';
import { useTimelineDrag } from './use-timeline-drag';

interface MeetingTimelineProps {
  cities: ReadonlyArray<City>;
  duration: number;
  onAddCity: (city: City) => void;
  onFindBestTime: () => void;
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

/**
 * Column geometry for the overlay bands. Every row (and the axis) shares
 * the grid `var(--info) 1fr var(--time)` with a `var(--cgap)` total column
 * gap, and each strip is 24 columns with 1px gaps. BASE is the strip width
 * minus its internal gaps, so one cell plus its trailing gap is
 * BASE / 24 + 1px. On mobile the side columns collapse to zero and rows
 * stack full-width, so the same calc keeps bands aligned with no fork.
 */
const STRIP_BASE = '(100% - var(--info) - var(--time) - var(--cgap) - 23px)';

function colLeft(hour: number): string {
  return `calc(var(--info) + var(--cgap) / 2 + ${STRIP_BASE} * ${hour} / 24 + ${hour}px)`;
}

function spanWidth(hours: number): string {
  return `calc(${STRIP_BASE} * ${hours} / 24 + ${hours - 1}px)`;
}

function colCenter(hour: number): string {
  return `calc(${colLeft(hour)} + (${STRIP_BASE} / 24) / 2)`;
}

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
  bestTime,
  cities,
  duration,
  onFindBestTime,
  onJumpToNow,
  onReferenceChange,
  referenceZone,
  selectedHour,
  zoneName,
}: {
  bestTime: BestTimeResult | null;
  cities: ReadonlyArray<City>;
  duration: number;
  onFindBestTime: () => void;
  onJumpToNow: () => void;
  onReferenceChange: (timezone: string) => void;
  referenceZone: string;
  selectedHour: number;
  zoneName: string;
}) {
  const outlier = getOutlierSummary(selectedHour, cities);
  const score = getOverallScore(selectedHour, cities);
  const scorePercent = Math.round(score * 100);
  const firstOutlier = outlier.outliers[0];
  const extraOutliers = outlier.outliers.length - 1;
  const allIn = outlier.inHours === outlier.total;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="font-semibold text-lg">Timeline</h2>
          <p className="text-muted-foreground text-sm">
            Drag to explore times across timezones
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StripAnchor
            cities={cities}
            onJumpToNow={onJumpToNow}
            onReferenceChange={onReferenceChange}
            referenceZone={referenceZone}
            selectedHour={selectedHour}
          />
          <Button onClick={onFindBestTime} size="sm" variant="default">
            Find Best Time
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${allIn ? 'bg-emerald-500' : 'bg-amber-500'}`}
        />
        <span className="font-medium text-foreground tabular-nums">
          {outlier.inHours} of {outlier.total}
        </span>
        {allIn ? (
          <span className="text-muted-foreground">works for everyone</span>
        ) : (
          firstOutlier && (
            <span className="text-muted-foreground">
              in hours · {firstOutlier.relation} in {firstOutlier.name}
              {extraOutliers > 0 && ` +${extraOutliers} more`}
            </span>
          )
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">Score:</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {scorePercent}%
        </span>
      </div>
      {bestTime && (
        <p className="text-muted-foreground text-xs">
          Best:{' '}
          <span className="font-medium text-foreground tabular-nums">
            {formatHourInZone(bestTime.startHour, referenceZone)} –{' '}
            {formatHourInZone(
              (bestTime.startHour + Math.max(1, Math.ceil(duration / 60))) % 24,
              referenceZone
            )}{' '}
            {zoneName}
          </span>{' '}
          · {Math.round(bestTime.score * 100)}% overlap
        </p>
      )}
    </>
  );
}

function AxisHeader({ zoneName }: { zoneName: string }) {
  return (
    <div className="mb-1 sm:grid sm:grid-cols-[var(--info)_1fr_var(--time)] sm:items-end sm:gap-x-2">
      <span className="hidden truncate text-[10px] text-muted-foreground uppercase tracking-wider sm:block">
        {zoneName}
      </span>
      <div
        className="grid min-w-0 gap-px"
        data-strip-col="true"
        style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
      >
        {HOURS.map((h) => (
          <div
            className={`text-center font-mono text-[10px] tabular-nums ${
              h % 6 === 0 ? 'text-foreground' : 'text-transparent'
            }`}
            key={`label-${h}`}
          >
            {h % 6 === 0 ? String(h).padStart(2, '0') : '·'}
          </div>
        ))}
      </div>
      <span className="hidden text-right text-[10px] text-muted-foreground uppercase tracking-wider sm:block">
        Local
      </span>
    </div>
  );
}

function ScoreStrip({
  cities,
  referenceZone,
}: {
  cities: ReadonlyArray<City>;
  referenceZone: string;
}) {
  return (
    <div className="mb-1 sm:grid sm:grid-cols-[var(--info)_1fr_var(--time)] sm:gap-x-2">
      <span className="hidden sm:block" />
      <div
        className="grid min-w-0 gap-px"
        style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}
      >
        {HOURS.map((h) => {
          const s = getOverallScoreAtReferenceHour(h, cities, referenceZone);
          return (
            <div
              className={`h-1 rounded-sm ${getScoreColor(s)}`}
              key={`score-${h}`}
            />
          );
        })}
      </div>
      <span className="hidden sm:block" />
    </div>
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
  zoneName,
}: {
  cities: ReadonlyArray<City>;
  duration: number;
  onHourChange: (hour: number) => void;
  referenceZone: string;
  selectedHour: number;
  zoneName: string;
  onRemoveCity: (cityId: string) => void;
  onUpdateWorkHours: (
    cityId: string,
    workStart: number,
    workEnd: number
  ) => void;
}) {
  const { timelineRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useTimelineDrag((column) =>
      onHourChange(referenceHourToUtcHour(column, referenceZone))
    );

  if (cities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center">
        <p className="font-medium text-sm">No cities yet</p>
        <p className="mt-1 text-muted-foreground text-xs">
          Add your first city below to start comparing timezones.
        </p>
      </div>
    );
  }

  const selectedColumn =
    Math.floor(utcHourToReferenceHour(selectedHour, referenceZone)) % 24;

  return (
    <div className="rounded-xl bg-muted/40 p-3 [--cgap:0px] [--info:0px] [--time:0px] sm:[--cgap:16px] sm:[--info:168px] sm:[--time:84px]">
      <div
        aria-label="Meeting time selector"
        aria-valuemax={23}
        aria-valuemin={0}
        aria-valuenow={selectedHour}
        className="cursor-crosshair touch-none select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onHourChange(
              referenceHourToUtcHour((selectedColumn + 23) % 24, referenceZone)
            );
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onHourChange(
              referenceHourToUtcHour((selectedColumn + 1) % 24, referenceZone)
            );
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
        <AxisHeader zoneName={zoneName} />

        <div className="relative mb-8">
          <ScoreStrip cities={cities} referenceZone={referenceZone} />
          <div className="flex flex-col gap-2 sm:gap-1">
            {cities.map((city) => (
              <CityRow
                city={city}
                key={city.id}
                onRemove={onRemoveCity}
                onUpdateWorkHours={onUpdateWorkHours}
                referenceZone={referenceZone}
                selectedHour={selectedHour}
              />
            ))}
          </div>
          <SelectedColumnBand selectedHour={selectedColumn} />
          <BestTimeBand
            cities={cities}
            duration={duration}
            referenceZone={referenceZone}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-card px-2 py-0.5 font-mono text-[11px] tabular-nums shadow-sm"
            style={{ left: colCenter(selectedColumn) }}
          >
            {formatHourInZone(selectedHour, referenceZone)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Translucent highlight spanning every row at the selected hour, so the
 * current selection reads as one vertical column.
 */
function SelectedColumnBand({ selectedHour }: { selectedHour: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 bottom-0 rounded-sm bg-primary/10 ring-1 ring-primary/20 ring-inset"
      style={{ left: colLeft(selectedHour), width: spanWidth(1) }}
    />
  );
}

/**
 * Best-time highlight band, aligned exactly to the hour grid (see
 * colLeft/spanWidth for the gap math).
 */
function BestTimeBand({
  cities,
  duration,
  referenceZone,
}: {
  cities: ReadonlyArray<City>;
  duration: number;
  referenceZone: string;
}) {
  const bestTime = useMemo(
    () => findBestTime(cities, duration),
    [cities, duration]
  );
  if (!bestTime) {
    return null;
  }
  const bestStart =
    Math.floor(utcHourToReferenceHour(bestTime.startHour, referenceZone)) % 24;
  const bestDurationHours = Math.max(1, Math.ceil(duration / 60));
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 bottom-0 border-emerald-500/50 border-x-2 bg-emerald-500/10"
      style={{
        left: colLeft(bestStart),
        width: spanWidth(bestDurationHours),
      }}
    />
  );
}

function TimelineLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-emerald-500/80" />
        <span className="text-muted-foreground">Core hours</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-amber-500/60" />
        <span className="text-muted-foreground">Shoulder</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-orange-500/40" />
        <span className="text-muted-foreground">Edge</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-neutral-400" />
        <span className="text-muted-foreground">Asleep</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-emerald-500/10 ring-2 ring-emerald-500/50 ring-inset" />
        <span className="text-muted-foreground">Best time</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-sm bg-primary/10 ring-1 ring-primary/20 ring-inset" />
        <span className="text-muted-foreground">Selected</span>
      </div>
    </div>
  );
}

export function MeetingTimeline({
  cities,
  duration,
  selectedHour,
  onFindBestTime,
  onHourChange,
  onJumpToNow,
  onReferenceChange,
  onRemoveCity,
  onUpdateWorkHours,
  onAddCity,
  referenceZone,
}: MeetingTimelineProps) {
  const existingIds = new Set(cities.map((c) => c.id));
  const bestTime = useMemo(
    () => findBestTime(cities, duration),
    [cities, duration]
  );
  const zoneName =
    referenceZone === 'UTC'
      ? 'UTC'
      : (cities.find((c) => c.timezone === referenceZone)?.name ?? 'UTC');

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <TimelineHeader
        bestTime={bestTime}
        cities={cities}
        duration={duration}
        onFindBestTime={onFindBestTime}
        onJumpToNow={onJumpToNow}
        onReferenceChange={onReferenceChange}
        referenceZone={referenceZone}
        selectedHour={selectedHour}
        zoneName={zoneName}
      />
      <TimelineContent
        cities={cities}
        duration={duration}
        onHourChange={onHourChange}
        onRemoveCity={onRemoveCity}
        onUpdateWorkHours={onUpdateWorkHours}
        referenceZone={referenceZone}
        selectedHour={selectedHour}
        zoneName={zoneName}
      />
      <div className="flex items-center gap-2">
        <CitySearch existingIds={existingIds} onAdd={onAddCity} />
      </div>
      <TimelineLegend />
      <p className="text-center text-muted-foreground text-xs">
        Times update live as you drag · Saved in this browser
      </p>
    </div>
  );
}
