import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { usePageTracking } from '@/lib/analytics/use-page-tracking';
import { Providers } from '@/lib/components/providers';
import { ReloadPrompt } from '@/lib/components/reload-prompt';
import { Toast } from '@/lib/components/ui/toast';
import { Layout } from '@/lib/layout';
import { MarketingLayout } from '@/lib/layout/marketing-layout';
import globalCss from '@/lib/styles/globals.css?url';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/utils/metadata';

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    shell?: 'app' | 'marketing';
  }
}

const TanStackRouterDevtools = lazy(() =>
  import('@tanstack/react-router-devtools').then((m) => ({
    default: m.TanStackRouterDevtools,
  }))
);

// Mirrors the previous index.html inline script: apply the persisted (or
// system) theme before first paint to avoid a flash of the wrong theme.
const THEME_INIT_SCRIPT = `
  'use strict';
  (() => {
    const theme = localStorage.getItem('vite-ui-theme');
    const root = document.documentElement;
    root.classList.add(
      theme === 'dark' ||
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light'
    );
  })();
`;

export const Route = createRootRouteWithContext()({
  component: RootPage,
  head: () => ({
    links: [
      {
        href: globalCss,
        rel: 'stylesheet',
      },
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
      {
        children: THEME_INIT_SCRIPT,
      },
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

function RootPage() {
  usePageTracking();
  const isMarketingRoute = useMatches().some(
    (match) => match.staticData?.shell === 'marketing'
  );

  const Shell = isMarketingRoute ? MarketingLayout : Layout;

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <Toast />
          <Shell>
            <Outlet />
          </Shell>
          <ReloadPrompt />
        </Providers>
        {import.meta.env.VITE_ENABLE_TANSTACK_DEVTOOLS ? (
          <Suspense>
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
