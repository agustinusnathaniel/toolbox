import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { Providers } from '@/lib/components/providers';
import { Toast } from '@/lib/components/ui/toast';
import { Layout } from '@/lib/layout';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/utils/metadata';

const TanStackRouterDevtools = lazy(() =>
  import('@tanstack/react-router-devtools').then((m) => ({
    default: m.TanStackRouterDevtools,
  }))
);
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({
    default: m.ReactQueryDevtools,
  }))
);

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        title: SITE_NAME,
      },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'application-name',
        content: SITE_NAME,
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: SITE_NAME,
      },
      {
        name: 'format-detection',
        content: 'telephone=no',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
      {
        name: 'og:type',
        content: 'website',
      },
      {
        name: 'og:title',
        content: SITE_NAME,
      },
      {
        name: 'og:description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: SITE_NAME,
      },
      {
        name: 'twitter:description',
        content: SITE_DESCRIPTION,
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon-180x180.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Providers>
        <Toast />
        <Layout>
          <Outlet />
        </Layout>
      </Providers>
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
      <Suspense>
        <ReactQueryDevtools />
      </Suspense>
    </>
  ),
});
