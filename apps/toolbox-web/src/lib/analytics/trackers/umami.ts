import type { AnalyticsTracker } from '../index';

export function createUmamiTracker(): AnalyticsTracker {
  return {
    track(event) {
      if (typeof window === 'undefined' || !window.umami) {
        return;
      }

      window.umami.track(event.name, event.properties);
    },

    page(params) {
      if (typeof window === 'undefined' || !window.umami) {
        return;
      }

      window.umami.track((props) => ({
        ...props,
        url: params.path,
        title: params.name,
      }));
    },
  };
}
