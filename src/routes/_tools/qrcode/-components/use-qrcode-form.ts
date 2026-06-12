import { useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import type { VCardFormData } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import { generateVCardString } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import { copyToClipboard } from '@/lib/utils/clipboard';

export type QRMode = 'url' | 'vcard';

export interface UrlState {
  bgColor: string;
  fgColor: string;
  value: string;
}

export interface VCardState {
  bgColor: string;
  city: string;
  companyName: string;
  country: string;
  emailAddress: string;
  fgColor: string;
  firstName: string;
  jobTitle: string;
  lastName: string;
  mobilePhoneNumber: string;
  otherPhoneNumber: string;
  postalCode: string;
  state: string;
  streetAddress: string;
  websiteURL: string;
}

const DEFAULT_URL_STATE: UrlState = {
  value: 'https://google.com',
  fgColor: '#000000',
  bgColor: '#ffffff',
};

const DEFAULT_VCARD_STATE: VCardState = {
  firstName: '',
  lastName: '',
  mobilePhoneNumber: '',
  otherPhoneNumber: '',
  emailAddress: '',
  companyName: '',
  jobTitle: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  websiteURL: '',
  fgColor: '#000000',
  bgColor: '#ffffff',
};

const STORAGE_KEY_MODE = 'toolbox:qr-mode';
const STORAGE_KEY_URL = 'toolbox:qr-url';
const STORAGE_KEY_VCARD = 'toolbox:qr-vcard';

type SearchParams = {
  mode?: 'url' | 'vcard';
  value?: string;
  fg?: string;
  bg?: string;
  fn?: string;
  ln?: string;
  mp?: string;
  op?: string;
  em?: string;
  co?: string;
  jt?: string;
  st?: string;
  ct?: string;
  sa?: string;
  pc?: string;
  cn?: string;
  wb?: string;
};

function formatHex(color?: string): string | undefined {
  if (!color) {
    return;
  }
  if (color.startsWith('#')) {
    return color;
  }
  if (color.startsWith('%23')) {
    return `#${color.slice(3)}`;
  }
  return `#${color}`;
}

function buildUrlParams(state: UrlState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.value) {
    params.set('value', state.value);
  }
  if (state.fgColor !== '#000000') {
    params.set('fg', state.fgColor);
  }
  if (state.bgColor !== '#ffffff') {
    params.set('bg', state.bgColor);
  }
  return params;
}

function buildVCardParams(state: VCardState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.firstName) {
    params.set('fn', state.firstName);
  }
  if (state.lastName) {
    params.set('ln', state.lastName);
  }
  if (state.mobilePhoneNumber) {
    params.set('mp', state.mobilePhoneNumber);
  }
  if (state.otherPhoneNumber) {
    params.set('op', state.otherPhoneNumber);
  }
  if (state.emailAddress) {
    params.set('em', state.emailAddress);
  }
  if (state.companyName) {
    params.set('co', state.companyName);
  }
  if (state.jobTitle) {
    params.set('jt', state.jobTitle);
  }
  if (state.streetAddress) {
    params.set('st', state.streetAddress);
  }
  if (state.city) {
    params.set('ct', state.city);
  }
  if (state.state) {
    params.set('sa', state.state);
  }
  if (state.postalCode) {
    params.set('pc', state.postalCode);
  }
  if (state.country) {
    params.set('cn', state.country);
  }
  if (state.websiteURL) {
    params.set('wb', state.websiteURL);
  }
  if (state.fgColor !== '#000000') {
    params.set('fg', state.fgColor);
  }
  if (state.bgColor !== '#ffffff') {
    params.set('bg', state.bgColor);
  }
  return params;
}

function buildVcardStateFromSearch(search: SearchParams): VCardState {
  return {
    firstName: search.fn ?? DEFAULT_VCARD_STATE.firstName,
    lastName: search.ln ?? DEFAULT_VCARD_STATE.lastName,
    mobilePhoneNumber: search.mp ?? DEFAULT_VCARD_STATE.mobilePhoneNumber,
    otherPhoneNumber: search.op ?? DEFAULT_VCARD_STATE.otherPhoneNumber,
    emailAddress: search.em ?? DEFAULT_VCARD_STATE.emailAddress,
    companyName: search.co ?? DEFAULT_VCARD_STATE.companyName,
    jobTitle: search.jt ?? DEFAULT_VCARD_STATE.jobTitle,
    streetAddress: search.st ?? DEFAULT_VCARD_STATE.streetAddress,
    city: search.ct ?? DEFAULT_VCARD_STATE.city,
    state: search.sa ?? DEFAULT_VCARD_STATE.state,
    postalCode: search.pc ?? DEFAULT_VCARD_STATE.postalCode,
    country: search.cn ?? DEFAULT_VCARD_STATE.country,
    websiteURL: search.wb ?? DEFAULT_VCARD_STATE.websiteURL,
    fgColor: formatHex(search.fg) ?? DEFAULT_VCARD_STATE.fgColor,
    bgColor: formatHex(search.bg) ?? DEFAULT_VCARD_STATE.bgColor,
  };
}

function buildUrlStateFromSearch(search: SearchParams): UrlState {
  return {
    value: search.value ?? DEFAULT_URL_STATE.value,
    fgColor: formatHex(search.fg) ?? DEFAULT_URL_STATE.fgColor,
    bgColor: formatHex(search.bg) ?? DEFAULT_URL_STATE.bgColor,
  };
}

export function useQRCodeForm(search: SearchParams = {}) {
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

  const svgRef = useRef<SVGSVGElement | null>(null);

  const vcardString = useMemo(
    () => generateVCardString(vcardState as VCardFormData),
    [vcardState]
  );

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

  const handleSaveQR = (size: number) => {
    const svg = svgRef.current;
    if (!svg) {
      toast.error('QR code not ready');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2000 / size;
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = size * scale;
      resizedCanvas.height = size * scale;
      const ctx = resizedCanvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas');
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);

      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = resizedCanvas.toDataURL();
      link.click();

      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      toast.error('Failed to render QR code');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopyShareableLink = () => {
    const params = new URLSearchParams();

    if (mode !== 'url') {
      params.set('mode', mode);
    }

    if (mode === 'url') {
      const urlParams = buildUrlParams(urlState);
      for (const [key, value] of urlParams) {
        params.set(key, value);
      }
    } else {
      const vcardParams = buildVCardParams(vcardState);
      for (const [key, value] of vcardParams) {
        params.set(key, value);
      }
    }

    const queryString = params.toString();
    const url = queryString
      ? `${window.location.origin}${window.location.pathname}?${queryString}`
      : `${window.location.origin}${window.location.pathname}`;
    copyToClipboard(url, 'Copied Shareable Link');
  };

  return {
    mode,
    setMode,
    svgRef,
    urlState,
    vcardState,
    vcardString,
    updateUrlField,
    updateVCardField,
    handleSaveQR,
    handleCopyShareableLink,
  };
}
