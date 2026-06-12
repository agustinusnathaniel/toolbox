import { parseColor } from '@react-stately/color';
import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { ColorArea } from '@/lib/components/ui/color-area';
import { ColorField } from '@/lib/components/ui/color-field';
import { ColorPicker } from '@/lib/components/ui/color-picker';
import {
  ColorSlider,
  ColorSliderTrack,
} from '@/lib/components/ui/color-slider';
import { ColorSwatch } from '@/lib/components/ui/color-swatch';
import { ColorThumb } from '@/lib/components/ui/color-thumb';
import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import {
  Popover,
  PopoverBody,
  PopoverContent,
} from '@/lib/components/ui/popover';
import { Textarea } from '@/lib/components/ui/textarea';
import type { VCardState } from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

type VCardQRCardProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  qrSize: number;
  vcardState: VCardState;
  vcardString: string;
  onSaveQR: (size: number) => void;
  onCopyShareableLink: () => void;
  onUpdateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
};

export function VCardQRCard({
  svgRef,
  qrSize,
  vcardState,
  vcardString,
  onSaveQR,
  onCopyShareableLink,
  onUpdateVCardField,
}: VCardQRCardProps) {
  return (
    <Card>
      <CardHeader title="VCard QR Code" />
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: vcardState.bgColor }}
            >
              <QRCodeSVG
                bgColor={vcardState.bgColor}
                fgColor={vcardState.fgColor}
                ref={svgRef}
                size={qrSize}
                value={vcardString || ' '}
              />
            </div>
            <Button intent="primary" onPress={() => onSaveQR(qrSize)}>
              Save QR Code
            </Button>
            <Button intent="outline" onPress={onCopyShareableLink}>
              Copy Shareable Link
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
                      onUpdateVCardField('firstName', e.currentTarget.value)
                    }
                    value={vcardState.firstName}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="vcard-lastName">Last Name</Label>
                  <Input
                    id="vcard-lastName"
                    onChange={(e) =>
                      onUpdateVCardField('lastName', e.currentTarget.value)
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
                    onUpdateVCardField(
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
                    onUpdateVCardField(
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
                    onUpdateVCardField('emailAddress', e.currentTarget.value)
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
                    onUpdateVCardField('companyName', e.currentTarget.value)
                  }
                  value={vcardState.companyName}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="vcard-jobTitle">Job Title</Label>
                <Input
                  id="vcard-jobTitle"
                  onChange={(e) =>
                    onUpdateVCardField('jobTitle', e.currentTarget.value)
                  }
                  value={vcardState.jobTitle}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="vcard-streetAddress">Street</Label>
                <Input
                  id="vcard-streetAddress"
                  onChange={(e) =>
                    onUpdateVCardField('streetAddress', e.currentTarget.value)
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
                      onUpdateVCardField('city', e.currentTarget.value)
                    }
                    value={vcardState.city}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="vcard-state">State</Label>
                  <Input
                    id="vcard-state"
                    onChange={(e) =>
                      onUpdateVCardField('state', e.currentTarget.value)
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
                      onUpdateVCardField('postalCode', e.currentTarget.value)
                    }
                    value={vcardState.postalCode}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="vcard-country">Country</Label>
                  <Input
                    id="vcard-country"
                    onChange={(e) =>
                      onUpdateVCardField('country', e.currentTarget.value)
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
                    onUpdateVCardField('websiteURL', e.currentTarget.value)
                  }
                  value={vcardState.websiteURL}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  intent="outline"
                  onPress={() => {
                    onUpdateVCardField('fgColor', '#000000');
                    onUpdateVCardField('bgColor', '#ffffff');
                  }}
                  size="sm"
                >
                  Standard
                </Button>
                <Button
                  intent="outline"
                  onPress={() => {
                    onUpdateVCardField('fgColor', '#ffffff');
                    onUpdateVCardField('bgColor', '#000000');
                  }}
                  size="sm"
                >
                  Dark Mode
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="vcard-fgColor">Foreground Color</Label>
                <ColorPicker
                  onChange={(c) =>
                    onUpdateVCardField(
                      'fgColor',
                      c.toFormat('hex').toString() ?? '#000000'
                    )
                  }
                  value={parseColor(vcardState.fgColor)}
                >
                  <Popover>
                    <Button data-slot="control" intent="plain">
                      <ColorSwatch />
                      Select color
                    </Button>
                    <PopoverContent className="[--gutter:--spacing(1)]">
                      <PopoverBody>
                        <div className="space-y-(--gutter)">
                          <ColorArea
                            colorSpace="rgb"
                            xChannel="red"
                            xName="red"
                            yChannel="green"
                            yName="green"
                          />
                          <ColorSlider channel="hue" colorSpace="hsb">
                            <ColorSliderTrack>
                              <ColorThumb />
                            </ColorSliderTrack>
                          </ColorSlider>
                          <ColorField aria-label="Color">
                            <Input />
                          </ColorField>
                        </div>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </ColorPicker>
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
  );
}
