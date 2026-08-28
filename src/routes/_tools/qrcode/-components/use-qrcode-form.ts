import { useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import type { VCardFormData } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import { generateVCardString } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import type {
  QRMode,
  SearchParams,
  UrlState,
  VCardState,
} from '@/lib/tools/qrcode-generator/adapters/qrcode-params';
import {
  buildUrlParams,
  buildUrlStateFromSearch,
  buildVCardParams,
  buildVcardStateFromSearch,
  DEFAULT_URL_STATE,
  DEFAULT_VCARD_STATE,
} from '@/lib/tools/qrcode-generator/adapters/qrcode-params';
import { copyToClipboard } from '@/lib/utils/clipboard';

import { svgToPngDownload } from './qr-download';

const STORAGE_KEY_MODE = 'toolbox:qr-mode';
const STORAGE_KEY_URL = 'toolbox:qr-url';
const STORAGE_KEY_VCARD = 'toolbox:qr-vcard';

function useQRStates(search: SearchParams) {
  const hasSearchParams = Object.keys(search).length > 0;
  const [mode, setMode] = usePersistedState<QRMode>(
    STORAGE_KEY_MODE,
    'url',
    hasSearchParams ? (search.mode ?? 'url') : undefined
  );
  const [urlState, setUrlState] = usePersistedState<UrlState>(
    STORAGE_KEY_URL,
    DEFAULT_URL_STATE,
    hasSearchParams ? buildUrlStateFromSearch(search) : undefined
  );
  const [vcardState, setVcardState] = usePersistedState<VCardState>(
    STORAGE_KEY_VCARD,
    DEFAULT_VCARD_STATE,
    hasSearchParams ? buildVcardStateFromSearch(search) : undefined
  );
  return { mode, setMode, setUrlState, setVcardState, urlState, vcardState };
}

function createUpdateHandlers(
  setUrlState: React.Dispatch<React.SetStateAction<UrlState>>,
  setVcardState: React.Dispatch<React.SetStateAction<VCardState>>
) {
  const updateUrlField = <K extends keyof UrlState>(
    field: K,
    value: UrlState[K]
  ) => {
    setUrlState((prev) => ({ ...prev, [field]: value }));
  };
  const updateVCardField = <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => {
    setVcardState((prev) => ({ ...prev, [field]: value }));
  };
  return { updateUrlField, updateVCardField };
}

function useQRShareableLink(
  mode: QRMode,
  urlState: UrlState,
  vcardState: VCardState
) {
  return () => {
    const params = new URLSearchParams();
    if (mode !== 'url') {
      params.set('mode', mode);
    }
    const sourceParams =
      mode === 'url' ? buildUrlParams(urlState) : buildVCardParams(vcardState);
    for (const [key, value] of sourceParams) {
      params.set(key, value);
    }
    const queryString = params.toString();
    const url = queryString
      ? `${window.location.origin}${window.location.pathname}?${queryString}`
      : `${window.location.origin}${window.location.pathname}`;
    return copyToClipboard(url, 'Copied Shareable Link');
  };
}

export function useQRCodeForm(search: SearchParams = {}) {
  const { mode, setMode, urlState, setUrlState, vcardState, setVcardState } =
    useQRStates(search);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const vcardString = useMemo(
    () => generateVCardString(vcardState as VCardFormData),
    [vcardState]
  );
  const { updateUrlField, updateVCardField } = createUpdateHandlers(
    setUrlState,
    setVcardState
  );
  const handleSaveQR = () => {
    const svg = svgRef.current;
    if (!svg) {
      toast.error('QR code not ready');
      return;
    }
    svgToPngDownload(svg);
  };
  const handleCopyShareableLink = useQRShareableLink(
    mode,
    urlState,
    vcardState
  );
  return {
    handleCopyShareableLink,
    handleSaveQR,
    mode,
    setMode,
    svgRef,
    updateUrlField,
    updateVCardField,
    urlState,
    vcardState,
    vcardString,
  };
}
