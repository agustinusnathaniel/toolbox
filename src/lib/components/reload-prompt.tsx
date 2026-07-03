import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useIsMobile } from '@/lib/hooks/use-mobile';

import { useRegisterSW } from 'virtual:pwa-register/react';

const TOAST_ID = 'pwa-update';
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function ReloadPrompt() {
  const isMobile = useIsMobile();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }

      registrationRef.current = registration;
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const registration = registrationRef.current;
      if (!registration || registration.installing || !navigator.onLine) {
        return;
      }

      await registration.update();
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (needRefresh) {
      toast.info('New version available', {
        id: TOAST_ID,
        position: isMobile ? 'bottom-center' : 'top-right',
        description: 'Reload to get the latest updates.',
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: 'Reload',
          onClick: () => updateServiceWorker(true),
        },
        cancel: {
          label: 'Dismiss',
          onClick: () => {
            setNeedRefresh(false);
            toast.dismiss(TOAST_ID);
          },
        },
      });
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh, isMobile]);

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', {
        id: `${TOAST_ID}-offline`,
        position: isMobile ? 'bottom-center' : 'top-right',
        description: 'You can use the app without an internet connection.',
        duration: 5000,
        cancel: {
          label: 'OK',
          onClick: () => {
            setOfflineReady(false);
            toast.dismiss(`${TOAST_ID}-offline`);
          },
        },
      });
    }
  }, [offlineReady, setOfflineReady, isMobile]);

  return null;
}
