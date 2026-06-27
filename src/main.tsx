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
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  // Disabled: TanStack Router calls document.startViewTransition() without
  // try/catch. When a transition is already in progress (rapid nav, tab switch,
  // concurrent render), the browser throws InvalidStateError and leaves a white
  // screen. React fixed their own handling (facebook/react#34098) but TanStack
  // Router bypasses it. Route animations are handled via CSS keyframes instead
  // (see globals.css .route-transition).
  defaultViewTransition: false,
  defaultPendingComponent: PendingPage,
  defaultNotFoundComponent: NotFoundPage,
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
