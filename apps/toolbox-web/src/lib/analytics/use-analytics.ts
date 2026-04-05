import { useCallback, useEffect } from 'react';

import {
  analytics,
  trackToolAction,
  trackToolCompletion,
  trackToolEntry,
} from './index';

export function useAnalytics() {
  const track = useCallback(
    (event: {
      name: string;
      properties?: Record<string, string | number | boolean>;
    }) => {
      analytics.track(event);
    },
    []
  );

  const page = useCallback((params: { name: string; path: string }) => {
    analytics.page(params);
  }, []);

  return { track, page };
}

export function useToolTracking(toolId: string, toolName: string) {
  useEffect(() => {
    trackToolEntry(toolId, toolName);
  }, [toolId, toolName]);

  const trackAction = useCallback(
    (action: string) => {
      trackToolAction(toolId, toolName, action);
    },
    [toolId, toolName]
  );

  const trackComplete = useCallback(
    (success: boolean) => {
      trackToolCompletion(toolId, toolName, success);
    },
    [toolId, toolName]
  );

  return {
    trackAction,
    trackComplete,
  };
}
