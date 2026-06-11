import { useCallback, useEffect } from 'react';

import { trackToolAction, trackToolCompletion, trackToolEntry } from './index';

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
