import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { queryClient } from '@/lib/services/api/constants';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import '@fontsource-variable/onest';
import '@/lib/styles/globals.css';

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
import { Loader } from '@/lib/components/ui/loader';

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultViewTransition: {
    types: ({ pathChanged }) => (pathChanged ? [] : false),
  },
  defaultPendingComponent: () => (
    <div className="mx-auto">
      <Loader className="size-12" variant="ring" />
    </div>
  ),
  defaultNotFoundComponent: () => (
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
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  return <RouterProvider router={router} />;
};

const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}
