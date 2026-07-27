export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
};

export type AnalyticsTracker = {
  track: (event: AnalyticsEvent) => void;
  page: (params: { name: string; path: string }) => void;
};

const listeners: Set<AnalyticsTracker> = new Set();

const isDev =
  import.meta.env.DEV || import.meta.env.VITE_ANALYTICS_DEBUG === true;

export const analytics = {
  addTracker(tracker: AnalyticsTracker): () => void {
    listeners.add(tracker);
    return () => listeners.delete(tracker);
  },

  page(params: { name: string; path: string }): void {
    if (isDev) {
      console.log('[Analytics] Page', params);
    }

    if (listeners.size === 0) {
      return;
    }

    for (const tracker of listeners) {
      try {
        tracker.page(params);
      } catch {
        // Silently ignore tracker errors
      }
    }
  },
  track(event: AnalyticsEvent): void {
    const enriched: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp ?? Date.now(),
    };

    if (isDev) {
      console.log('[Analytics]', enriched);
    }

    if (listeners.size === 0) {
      return;
    }

    for (const tracker of listeners) {
      try {
        tracker.track(enriched);
      } catch {
        // Silently ignore tracker errors
      }
    }
  },
};

export function trackToolEntry(toolId: string, toolName: string): void {
  analytics.track({
    name: 'tool_entry',
    properties: {
      tool_id: toolId,
      tool_name: toolName,
    },
  });
}

export function trackToolCompletion(
  toolId: string,
  toolName: string,
  success: boolean
): void {
  analytics.track({
    name: 'tool_completion',
    properties: {
      success,
      tool_id: toolId,
      tool_name: toolName,
    },
  });
}

export function trackToolAction(
  toolId: string,
  toolName: string,
  action: string
): void {
  analytics.track({
    name: 'tool_action',
    properties: {
      action,
      tool_id: toolId,
      tool_name: toolName,
    },
  });
}

export function trackToolError(
  toolId: string,
  toolName: string,
  errorMessage: string
): void {
  analytics.track({
    name: 'tool_error',
    properties: {
      error_message: errorMessage,
      tool_id: toolId,
      tool_name: toolName,
    },
  });
}
