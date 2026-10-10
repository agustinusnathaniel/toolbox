import { useCallback, useRef, useState } from 'react';

import { hourFromStripX } from '@/lib/tools/meeting-time-finder/adapters/meeting-time-finder';

/**
 * Resolve the pointer to an hour using the strip column's rect, not the
 * slider's: the slider also contains the info/time columns, so mapping
 * across the full width would offset every selection. Returns null when
 * the pointer is outside the strips (info/time columns hold the remove
 * button and work-hours editor — pressing those must not fling the
 * selection to midnight).
 */
function hourFromEvent(container: HTMLElement, clientX: number): number | null {
  const strip = container.querySelector('[data-strip-col]');
  if (!(strip instanceof HTMLElement)) {
    return null;
  }
  const rect = strip.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right) {
    return null;
  }
  return hourFromStripX(rect.left, rect.width, clientX);
}

export function useTimelineDrag(onHourChange: (hour: number) => void) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!timelineRef.current) {
        return;
      }
      const hour = hourFromEvent(timelineRef.current, e.clientX);
      if (hour !== null) {
        onHourChange(hour);
      }
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onHourChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!(isDragging && timelineRef.current)) {
        return;
      }
      const hour = hourFromEvent(timelineRef.current, e.clientX);
      if (hour !== null) {
        onHourChange(hour);
      }
    },
    [isDragging, onHourChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    timelineRef,
  };
}
