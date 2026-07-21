import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { usePageTracking } from '@/lib/analytics/use-page-tracking';
import { Providers } from '@/lib/components/providers';
import { Toast } from '@/lib/components/ui/toast';
import { Layout } from '@/lib/layout';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/utils/metadata';

const TanStackRouterDevtools = lazy(() =>
  import('@tanstack/react-router-devtools').then((m) => ({
    default: m.TanStackRouterDevtools,
  }))
);

export const Route = createRootRouteWithContext()({
  component: () => {
    usePageTracking();
    return (
      <>
        <HeadContent />
        <Providers>
          <Toast />
          <Layout>
            <Outlet />
          </Layout>
        </Providers>
        {import.meta.env.VITE_ENABLE_TANSTACK_DEVTOOLS ? (
          <Suspense>
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
        ) : null}
      </>
    );
  },
  head: () => ({
    links: [
      {
        href: '/favicon.ico',
        rel: 'icon',
      },
      {
        href: '/apple-touch-icon-180x180.png',
        rel: 'apple-touch-icon',
      },
      {
        href: '/manifest.webmanifest',
        rel: 'manifest',
      },
    ],
    meta: [
      {
        title: SITE_NAME,
      },
      {
        content: SITE_DESCRIPTION,
        name: 'description',
      },
      {
        content: 'width=device-width, initial-scale=1.0',
        name: 'viewport',
      },
      {
        content: SITE_NAME,
        name: 'application-name',
      },
      {
        content: 'yes',
        name: 'apple-mobile-web-app-capable',
      },
      {
        content: 'default',
        name: 'apple-mobile-web-app-status-bar-style',
      },
      {
        content: SITE_NAME,
        name: 'apple-mobile-web-app-title',
      },
      {
        content: 'telephone=no',
        name: 'format-detection',
      },
      {
        content: 'yes',
        name: 'mobile-web-app-capable',
      },
      {
        content: '#000000',
        name: 'theme-color',
      },
      {
        content: 'website',
        name: 'og:type',
      },
      {
        content: SITE_NAME,
        name: 'og:title',
      },
      {
        content: SITE_DESCRIPTION,
        name: 'og:description',
      },
      {
        content: 'summary_large_image',
        name: 'twitter:card',
      },
      {
        content: SITE_NAME,
        name: 'twitter:title',
      },
      {
        content: SITE_DESCRIPTION,
        name: 'twitter:description',
      },
    ],
    scripts: [
      ...(import.meta.env.VITE_UMAMI_SCRIPT_URL &&
      import.meta.env.VITE_UMAMI_WEBSITE_ID
        ? [
            {
              async: true,
              'data-performance': 'true',
              'data-website-id': import.meta.env.VITE_UMAMI_WEBSITE_ID,
              src: import.meta.env.VITE_UMAMI_SCRIPT_URL,
            },
          ]
        : []),
    ],
  }),
});
