import {
  getToolNavItems,
  type ToolNavItem,
} from '@/lib/navigation/tool-registry';

export const HOMEPAGE_FEATURED_TOOL_COUNT = 6;

export interface HomepageData {
  featuredTools: Array<ToolNavItem>;
}

export function getHomepageData(): HomepageData {
  return {
    featuredTools: getToolNavItems().slice(0, HOMEPAGE_FEATURED_TOOL_COUNT),
  };
}
