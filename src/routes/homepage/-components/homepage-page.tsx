import type { ToolNavItem } from '@/lib/navigation/tool-registry';
import { getToolNavItems } from '@/lib/navigation/tool-registry';

import { HomepagePrivacy } from './homepage-privacy';
import { HomepageHeader, HomepageHero } from './homepage-sections';
import { HomepageTools } from './homepage-tools';

const defaultTools = getToolNavItems();

export function HomepagePage({
  tools = defaultTools,
}: {
  tools?: Array<ToolNavItem>;
}) {
  return (
    <div className="overflow-x-clip">
      <a
        className="sr-only z-50 rounded-lg bg-bg px-4 py-2 font-medium text-fg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        href="#main-content"
      >
        Skip to content
      </a>
      <HomepageHeader />
      <main
        className="scroll-mt-4 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
        id="main-content"
        tabIndex={-1}
      >
        <HomepageHero tools={tools} />
        <HomepageTools tools={tools} />
        <HomepagePrivacy />
      </main>
    </div>
  );
}
