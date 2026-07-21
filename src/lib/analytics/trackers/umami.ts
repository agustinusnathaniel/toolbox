import type { AnalyticsTracker } from '../index';

export function createUmamiTracker(): AnalyticsTracker {
  return {
    page(params) {
      if (typeof window === 'undefined' || !window.umami) {
        return;
      }

      window.umami.track((props) => ({
        ...props,
        title: params.name,
        url: params.path,
      }));
    },
    track(event) {
      if (typeof window === 'undefined' || !window.umami) {
        return;
      }

      window.umami.track(event.name, event.properties);
    },
  };
}
