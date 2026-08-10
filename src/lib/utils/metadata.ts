export const SITE_NAME = 'Toolbox';
export const SITE_DESCRIPTION = 'A unified platform for useful web tools.';

export interface ToolMetadata {
  description: string;
  pageTitle: string;
  slug: string;
}

interface ToolRouteMetadata<T extends ToolMetadata> {
  head: () => {
    links: Array<{ href: string; rel: 'canonical' }>;
    meta: Array<
      | { title: string }
      | { content: string; name: string }
      | { content: string; property: string }
    >;
  };
  staticData: {
    meta: T;
  };
}

export function createToolRouteMetadata<T extends ToolMetadata>(
  meta: T
): ToolRouteMetadata<T> {
  const url = siteUrl(`/${meta.slug}`);

  return {
    head: () => ({
      links: [{ href: url, rel: 'canonical' }],
      meta: [
        { title: meta.pageTitle },
        { content: meta.description, name: 'description' },
        { content: meta.pageTitle, property: 'og:title' },
        { content: meta.description, property: 'og:description' },
        { content: 'website', property: 'og:type' },
        { content: url, property: 'og:url' },
        { content: siteUrl('/logo512.png'), property: 'og:image' },
        { content: 'Toolbox logo', property: 'og:image:alt' },
        { content: 'summary_large_image', name: 'twitter:card' },
        { content: meta.pageTitle, name: 'twitter:title' },
        { content: meta.description, name: 'twitter:description' },
        { content: siteUrl('/logo512.png'), name: 'twitter:image' },
        { content: 'Toolbox logo', name: 'twitter:image:alt' },
      ],
    }),
    staticData: { meta },
  };
}

const configuredSiteOrigin = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(
  /\/$/,
  ''
);

// Production builds should set VITE_PUBLIC_SITE_URL to the canonical origin.
// The fixed fallback keeps metadata stable in local and preview builds instead
// of deriving it from whatever host happened to render the page.
const SITE_ORIGIN = configuredSiteOrigin ?? 'https://toolbox.sznm.dev';

export function siteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
