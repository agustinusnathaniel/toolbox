'use client';

import { createFileRoute } from '@tanstack/react-router';
import type { VCardFormData } from '@toolbox/qrcode-core';
import { generateVCardString } from '@toolbox/qrcode-core';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';

import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { TOOL_META } from '@/lib/utils/metadata';

const meta = TOOL_META['qrcode-generator'];

export const Route = createFileRoute('/tools/qrcode-generator/')({
  component: QRCodeGeneratorPage,
  staticData: {
    pageTitle: meta.title,
  },
  head: () => ({
    meta: [
      { title: meta.title },
      { name: 'description', content: meta.description },
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:type', content: 'website' },
    ],
  }),
});

type QRMode = 'url' | 'vcard';

interface UrlState {
  fgColor: string;
  value: string;
}

interface VCardState {
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

function QRCodeGeneratorPage() {
  const [mode, setMode] = useState<QRMode>('url');
  const qrRef = useRef<HTMLCanvasElement>(null);

  const [urlState, setUrlState] = useState<UrlState>({
    value: 'https://google.com',
    fgColor: '#000000',
  });

  const [vcardState, setVcardState] = useState<VCardState>({
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
  });

  const qrSize = 220;

  const vcardString = generateVCardString(vcardState as VCardFormData);

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

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <div className="flex gap-2">
        <Button
          intent={mode === 'url' ? 'primary' : 'outline'}
          onPress={() => setMode('url')}
        >
          URL QR
        </Button>
        <Button
          intent={mode === 'vcard' ? 'primary' : 'outline'}
          onPress={() => setMode('vcard')}
        >
          VCard QR
        </Button>
      </div>

      {mode === 'url' && (
        <Card>
          <CardHeader title="URL QR Code" />
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-lg bg-white p-4">
                  <QRCodeCanvas
                    fgColor={urlState.fgColor}
                    size={qrSize}
                    value={urlState.value || ' '}
                  />
                </div>
                <canvas ref={qrRef} style={{ display: 'none' }} />
                <Button intent="primary" onPress={handleSaveQR}>
                  Save QR Code
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="url-value">URL / Text</Label>
                    <Input
                      id="url-value"
                      onChange={(e) =>
                        updateUrlField('value', e.currentTarget.value)
                      }
                      placeholder="https://example.com"
                      value={urlState.value}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="url-fgColor">Foreground Color</Label>
                    <Input
                      id="url-fgColor"
                      onChange={(e) =>
                        updateUrlField('fgColor', e.currentTarget.value)
                      }
                      type="color"
                      value={urlState.fgColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'vcard' && (
        <Card>
          <CardHeader title="VCard QR Code" />
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-lg bg-white p-4">
                  <QRCodeCanvas
                    fgColor={vcardState.fgColor}
                    size={qrSize}
                    value={vcardString || ' '}
                  />
                </div>
                <canvas ref={qrRef} style={{ display: 'none' }} />
                <Button intent="primary" onPress={handleSaveQR}>
                  Save QR Code
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-firstName">First Name</Label>
                      <Input
                        id="vcard-firstName"
                        onChange={(e) =>
                          updateVCardField('firstName', e.currentTarget.value)
                        }
                        value={vcardState.firstName}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-lastName">Last Name</Label>
                      <Input
                        id="vcard-lastName"
                        onChange={(e) =>
                          updateVCardField('lastName', e.currentTarget.value)
                        }
                        value={vcardState.lastName}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-mobilePhoneNumber">
                      Mobile Phone Number
                    </Label>
                    <Input
                      id="vcard-mobilePhoneNumber"
                      onChange={(e) =>
                        updateVCardField(
                          'mobilePhoneNumber',
                          e.currentTarget.value
                        )
                      }
                      type="tel"
                      value={vcardState.mobilePhoneNumber}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-otherPhoneNumber">Phone Number</Label>
                    <Input
                      id="vcard-otherPhoneNumber"
                      onChange={(e) =>
                        updateVCardField(
                          'otherPhoneNumber',
                          e.currentTarget.value
                        )
                      }
                      type="tel"
                      value={vcardState.otherPhoneNumber}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-emailAddress">Email</Label>
                    <Input
                      id="vcard-emailAddress"
                      onChange={(e) =>
                        updateVCardField('emailAddress', e.currentTarget.value)
                      }
                      type="email"
                      value={vcardState.emailAddress}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-companyName">Company</Label>
                    <Input
                      id="vcard-companyName"
                      onChange={(e) =>
                        updateVCardField('companyName', e.currentTarget.value)
                      }
                      value={vcardState.companyName}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-jobTitle">Job Title</Label>
                    <Input
                      id="vcard-jobTitle"
                      onChange={(e) =>
                        updateVCardField('jobTitle', e.currentTarget.value)
                      }
                      value={vcardState.jobTitle}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-streetAddress">Street</Label>
                    <Input
                      id="vcard-streetAddress"
                      onChange={(e) =>
                        updateVCardField('streetAddress', e.currentTarget.value)
                      }
                      value={vcardState.streetAddress}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-city">City</Label>
                      <Input
                        id="vcard-city"
                        onChange={(e) =>
                          updateVCardField('city', e.currentTarget.value)
                        }
                        value={vcardState.city}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-state">State</Label>
                      <Input
                        id="vcard-state"
                        onChange={(e) =>
                          updateVCardField('state', e.currentTarget.value)
                        }
                        value={vcardState.state}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-postalCode">Postal Code</Label>
                      <Input
                        id="vcard-postalCode"
                        onChange={(e) =>
                          updateVCardField('postalCode', e.currentTarget.value)
                        }
                        value={vcardState.postalCode}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="vcard-country">Country</Label>
                      <Input
                        id="vcard-country"
                        onChange={(e) =>
                          updateVCardField('country', e.currentTarget.value)
                        }
                        value={vcardState.country}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-websiteURL">Website</Label>
                    <Input
                      id="vcard-websiteURL"
                      onChange={(e) =>
                        updateVCardField('websiteURL', e.currentTarget.value)
                      }
                      value={vcardState.websiteURL}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vcard-fgColor">Foreground Color</Label>
                    <Input
                      id="vcard-fgColor"
                      onChange={(e) =>
                        updateVCardField('fgColor', e.currentTarget.value)
                      }
                      type="color"
                      value={vcardState.fgColor}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>VCard Preview</Label>
              <Textarea
                className="min-h-[120px] font-mono text-xs"
                disabled
                rows={6}
                value={vcardString}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader title="Features" />
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Badge intent="success">URL & VCard QR Generation</Badge>
            </li>
            <li className="flex items-center gap-2">
              <Badge intent="info">Customizable Colors</Badge>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-fg text-xs">
                No data is sent to any server
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
