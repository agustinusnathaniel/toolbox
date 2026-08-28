import { Label } from '@/lib/components/ui/field';
import { Input } from '@/lib/components/ui/input';
import type { VCardState } from '@/lib/tools/qrcode-generator/adapters/qrcode-params';

type Props = {
  vcardState: VCardState;
  onUpdateVCardField: <K extends keyof VCardState>(
    field: K,
    value: VCardState[K]
  ) => void;
};

export function VCardNameFields({ vcardState, onUpdateVCardField }: Props) {
  return (
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
  );
}

export function VCardPhoneFields({ vcardState, onUpdateVCardField }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label htmlFor="vcard-mobilePhoneNumber">Mobile Phone Number</Label>
        <Input
          id="vcard-mobilePhoneNumber"
          onChange={(e) =>
            onUpdateVCardField('mobilePhoneNumber', e.currentTarget.value)
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
            onUpdateVCardField('otherPhoneNumber', e.currentTarget.value)
          }
          type="tel"
          value={vcardState.otherPhoneNumber}
        />
      </div>
    </>
  );
}

export function VCardContactFields({ vcardState, onUpdateVCardField }: Props) {
  return (
    <>
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
    </>
  );
}

export function VCardStreetField({ vcardState, onUpdateVCardField }: Props) {
  return (
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
  );
}

export function VCardCityStateFields({
  vcardState,
  onUpdateVCardField,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="vcard-city">City</Label>
        <Input
          id="vcard-city"
          onChange={(e) => onUpdateVCardField('city', e.currentTarget.value)}
          value={vcardState.city}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="vcard-state">State</Label>
        <Input
          id="vcard-state"
          onChange={(e) => onUpdateVCardField('state', e.currentTarget.value)}
          value={vcardState.state}
        />
      </div>
    </div>
  );
}

export function VCardPostalCountryFields({
  vcardState,
  onUpdateVCardField,
}: Props) {
  return (
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
          onChange={(e) => onUpdateVCardField('country', e.currentTarget.value)}
          value={vcardState.country}
        />
      </div>
    </div>
  );
}

export function VCardWebsiteField({ vcardState, onUpdateVCardField }: Props) {
  return (
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
  );
}
