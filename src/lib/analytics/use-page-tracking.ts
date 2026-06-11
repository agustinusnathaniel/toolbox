import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

import { analytics } from './index';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analytics.page({
      name: document.title,
      path: location.pathname,
    });
  }, [location.pathname]);
}
