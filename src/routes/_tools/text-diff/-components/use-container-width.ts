'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks the rendered width (px) of the element the returned ref is attached
 * to via ResizeObserver. Before the first measurement the viewport width is
 * used as a stand-in so a desktop user never sees the diff style flip on
 * first paint; the observer corrects it as soon as the element is laid out.
 */
export function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth
  );

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return;
    }
    setWidth(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry !== undefined) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
