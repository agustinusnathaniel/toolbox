import { useCallback, useRef, useState } from 'react';

export function useTimelineDrag(onHourChange: (hour: number) => void) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!timelineRef.current) {
        return;
      }
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const hour = Math.floor((x / rect.width) * 24);
      const clamped = Math.max(0, Math.min(23, hour));
      onHourChange(clamped);
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
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const hour = Math.floor((x / rect.width) * 24);
      const clamped = Math.max(0, Math.min(23, hour));
      onHourChange(clamped);
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
