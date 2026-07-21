import { createRouter, RouterProvider } from '@tanstack/react-router';
import { lazy, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import '@fontsource-variable/onest';
import '@/lib/styles/globals.css';

import { analytics } from '@/lib/analytics';
import { createUmamiTracker } from '@/lib/analytics/trackers/umami';
import { ReloadPrompt } from '@/lib/components/reload-prompt';
import { buttonStyles } from '@/lib/components/ui/button';

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
const Link = lazy(() =>
  import('@/lib/components/ui/link').then((m) => ({
    default: m.Link,
  }))
);
const Loader = lazy(() =>
  import('@/lib/components/ui/loader').then((m) => ({
    default: m.Loader,
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

const router = createRouter({
  defaultNotFoundComponent: NotFoundPage,
  defaultPendingComponent: PendingPage,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  // View Transition API: errors (InvalidStateError on concurrent transitions)
  // are caught by a pnpm patch on @tanstack/router-core that falls back to
  // direct update. CSS animations via .route-transition serve as fallback.
  // See patches/@tanstack__router-core@1.171.13.patch for the catch clause.
  defaultViewTransition: {
    types: ({ pathChanged }) => (pathChanged ? [] : false),
  },
  routeTree,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    meta?: {
      pageTitle: string;
      description: string;
      slug: string;
    };
  }
}

const App = () => <RouterProvider router={router} />;

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
      <ReloadPrompt />
    </StrictMode>
  );
}
