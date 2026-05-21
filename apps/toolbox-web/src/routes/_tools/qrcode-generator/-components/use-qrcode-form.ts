import { useMemo, useRef, useState } from 'react';

import type { VCardFormData } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import { generateVCardString } from '@/lib/tools/qrcode-generator/adapters/qrcode';

export type QRMode = 'url' | 'vcard';

export interface UrlState {
  fgColor: string;
  value: string;
}

export interface VCardState {
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
};

export function useQRCodeForm() {
  const [mode, setMode] = useState<QRMode>('url');
  const qrRef = useRef<HTMLCanvasElement>(null);

  const [urlState, setUrlState] = useState<UrlState>(DEFAULT_URL_STATE);
  const [vcardState, setVcardState] = useState<VCardState>(DEFAULT_VCARD_STATE);

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

  const handleSaveQR = () => {
    const canvas = qrRef.current;
    if (!canvas) {
      return;
    }

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.setAttribute('width', '2000');
    resizedCanvas.setAttribute('height', '2000');
    const ctx = resizedCanvas.getContext('2d');
    ctx?.drawImage(canvas, 0, 0, 2000, 2000);

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = resizedCanvas.toDataURL();
    link.click();
  };

  return {
    mode,
    setMode,
    qrRef,
    urlState,
    vcardState,
    vcardString,
    updateUrlField,
    updateVCardField,
    handleSaveQR,
  };
}
