import { useMemo, useRef, useState } from 'react';

import type { VCardFormData } from '@/lib/tools/qrcode-generator/adapters/qrcode';
import { generateVCardString } from '@/lib/tools/qrcode-generator/adapters/qrcode';

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

export function useQRCodeForm() {
  const [mode, setMode] = useState<QRMode>('url');

  const [urlState, setUrlState] = useState<UrlState>(DEFAULT_URL_STATE);
  const [vcardState, setVcardState] = useState<VCardState>(DEFAULT_VCARD_STATE);

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
      ctx?.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);

      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = resizedCanvas.toDataURL();
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
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
  };
}
