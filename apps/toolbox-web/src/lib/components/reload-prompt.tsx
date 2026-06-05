import { useEffect } from 'react';
import { toast } from 'sonner';

import { useRegisterSW } from 'virtual:pwa-register/react';

const TOAST_ID = 'pwa-update';
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }

      setInterval(async () => {
        if (registration.installing || !navigator.onLine) {
          return;
        }

        await registration.update();
      }, UPDATE_CHECK_INTERVAL_MS);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast.info('New version available', {
        id: TOAST_ID,
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
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  useEffect(() => {
    if (offlineReady) {
      toast.success('App ready to work offline', {
        id: `${TOAST_ID}-offline`,
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
  }, [offlineReady, setOfflineReady]);

  return null;
}
