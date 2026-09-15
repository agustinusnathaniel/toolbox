'use client';

import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useCopyShareableLink } from '@/lib/hooks/use-copy-shareable-link';
import {
  buildWALinkSearchParams,
  type WALinkInputs,
} from '@/lib/tools/wa-link-helper/adapters/wa-link';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { recordToSearchParams } from '@/lib/utils/search-params';

interface CopyArgs extends WALinkInputs {
  onCopy: (action: string) => void;
}

export function useWaLinkCopy({
  countryCode,
  phoneNumber,
  text,
  onCopy,
}: {
  countryCode?: string;
  phoneNumber?: string;
  text?: string;
  onCopy: (action: string) => void;
}) {
  const navigate = useNavigate({ from: '/wa-link-helper/' });

  const copyShareableLink = useCopyShareableLink(
    () =>
      recordToSearchParams(
        buildWALinkSearchParams({ countryCode, phoneNumber, text })
      ),
    onCopy,
    'copy_shareable'
  );

  const handleCopyShareableLink = async () => {
    navigate({
      replace: true,
      search: (prev) => ({
        ...prev,
        ...buildWALinkSearchParams({ countryCode, phoneNumber, text }),
      }),
    });
    await copyShareableLink();
  };

  return { handleCopyShareableLink };
}

export async function copyWaLink(
  link: string,
  isPhoneValid: boolean,
  trackAction: (action: string) => void
): Promise<void> {
  if (!(isPhoneValid && link)) {
    toast('Invalid Phone Number', {
      description:
        'The phone number is not valid for the selected country. Please check and try again.',
    });
    return;
  }
  if (await copyToClipboard(link, 'Copied Link')) {
    trackAction('copy_link');
  }
}

export type { CopyArgs };
