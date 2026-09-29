'use client';

import { type ToOptions, useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

/**
 * `defaultPreload: 'intent'` only fires for TanStack's own <Link>. The sidebar
 * and mobile bottom nav render react-aria links, which navigate client-side
 * through the RouterProvider but never preload, so their route chunks are only
 * requested on click. Prefetching is idempotent - the router returns early from
 * its own cache when the match is still fresh.
 */
export function usePrefetchRoute() {
  const router = useRouter();

  return useCallback(
    (to: ToOptions['to']) => {
      // A failed prefetch is silent on purpose: the click that follows re-runs
      // the same load and surfaces any failure through the error boundary, so
      // warning here would only repeat on every hover.
      router.preloadRoute({ to }).catch(() => undefined);
    },
    [router]
  );
}
