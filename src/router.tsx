import { createRouter } from '@tanstack/react-router';
import { lazy } from 'react';

import { analytics } from '@/lib/analytics';
import { createUmamiTracker } from '@/lib/analytics/trackers/umami';
import { buttonStyles } from '@/lib/components/ui/button';
import { Link } from '@/lib/components/ui/link';
import { Loader } from '@/lib/components/ui/loader';
import {
  parseSearchParams,
  stringifySearchParams,
} from '@/lib/utils/search-params';

import { routeTree } from './routeTree.gen';

analytics.addTracker(createUmamiTracker());

const Card = lazy(() =>
  import('@/lib/components/ui/card').then((m) => ({
    default: m.Card,
  }))
);
const CardContent = lazy(() =>
  import('@/lib/components/ui/card').then((m) => ({
    default: m.CardContent,
  }))
);
const CardDescription = lazy(() =>
  import('@/lib/components/ui/card').then((m) => ({
    default: m.CardDescription,
  }))
);
const CardHeader = lazy(() =>
  import('@/lib/components/ui/card').then((m) => ({
    default: m.CardHeader,
  }))
);
const CardTitle = lazy(() =>
  import('@/lib/components/ui/card').then((m) => ({
    default: m.CardTitle,
  }))
);
const Container = lazy(() =>
  import('@/lib/components/ui/container').then((m) => ({
    default: m.Container,
  }))
);

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

const PendingPage = () => (
  <div className="mx-auto">
    <Loader className="size-12" variant="ring" />
  </div>
);

export async function getRouter() {
  const router = createRouter({
    defaultNotFoundComponent: NotFoundPage,
    defaultPendingComponent: PendingPage,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
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
