export const SITE_NAME = 'Toolbox';
export const SITE_DESCRIPTION = 'A unified platform for useful web tools.';

const configuredSiteOrigin = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(
  /\/$/,
  ''
);

// Production builds should set VITE_PUBLIC_SITE_URL to the canonical origin.
// The fixed fallback keeps metadata stable in local and preview builds instead
// of deriving it from whatever host happened to render the page.
export const SITE_ORIGIN = configuredSiteOrigin ?? 'https://toolbox.sznm.dev';

export function siteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
