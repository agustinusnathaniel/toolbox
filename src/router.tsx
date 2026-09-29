import { createRouter } from '@tanstack/react-router';

import { analytics } from '@/lib/analytics';
import { createUmamiTracker } from '@/lib/analytics/trackers/umami';
import { buttonStyles } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Container } from '@/lib/components/ui/container';
import { Link } from '@/lib/components/ui/link';
import { Skeleton } from '@/lib/components/ui/skeleton';
import {
  parseSearchParams,
  stringifySearchParams,
} from '@/lib/utils/search-params';

import { routeTree } from './routeTree.gen';

analytics.addTracker(createUmamiTracker());

const NotFoundPage = () => (
  <Container className="min-h-screen content-center">
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <CardTitle className="font-bold text-4xl">404</CardTitle>
        <CardDescription>Not Found</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          className={(renderProps) =>
            buttonStyles({ ...renderProps, intent: 'primary' })
          }
          href="/"
        >
          Back to Home
        </Link>
      </CardContent>
    </Card>
  </Container>
);

// A tool page is a heading above a content block, so the placeholder reserves
// the same two rows. `role="status"` names the region once for screen readers
// while the blocks stay aria-hidden, so the placeholder never announces as
// content.
const PendingPage = () => (
  <div
    aria-label="Loading page"
    className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 md:w-[80%]"
    role="status"
  >
    <Skeleton aria-hidden="true" className="h-8 w-56" isLoading />
    <Skeleton
      aria-hidden="true"
      className="h-72 w-full rounded-lg border"
      isLoading
    />
  </div>
);

export async function getRouter() {
  const router = createRouter({
    // Both windows only take effect for routes that define a loader, and no
    // tool route does, so these are inert defaults kept sane for the day one
    // does. Back-navigation already avoids a refetch for a different reason:
    // a resolved route chunk is latched on the route and never re-imported.
    defaultGcTime: 30 * 60_000,
    defaultNotFoundComponent: NotFoundPage,
    defaultPendingComponent: PendingPage,
    // Cache first, placeholder last. 500ms is the router default; stating it
    // makes the intent explicit - a preloaded match resolves from the router
    // cache, so the pending skeleton is only ever a fallback.
    defaultPendingMinMs: 500,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 5 * 60_000,
    defaultStructuralSharing: true,
    // View Transition API: errors (InvalidStateError on concurrent transitions)
    // fall back to direct updates; CSS animations via .route-transition serve
    // as the fallback animation.
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? [] : false),
    },
    // Keep search values as strings on both sides. The default
    // parseSearchWith(JSON.parse) coerces `?count=3` to the number 3 and the
    // default stringifySearch re-quotes parseable strings (`'3'` → `"3"`),
    // which fails every tool's z.string() search schema and triggers the error
    // boundary (see search-params.ts).
    parseSearch: parseSearchParams,
    routeTree,
    scrollRestoration: true,
    stringifySearch: stringifySearchParams,
  });

  if (typeof window !== 'undefined') {
    // Ensure the initial route's async component chunks are loaded before the
    // hydration pass, so the client's first render matches the server markup
    // instead of flashing the pending fallback.
    await router.load();
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: Awaited<ReturnType<typeof getRouter>>;
  }
  interface StaticDataRouteOption {
    meta?: {
      pageTitle: string;
      description: string;
      slug: string;
    };
  }
}
