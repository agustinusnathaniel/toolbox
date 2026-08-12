export interface VCardFormData {
  city?: string;
  companyName?: string;
  country?: string;
  emailAddress?: string;
  firstName?: string;
  jobTitle?: string;
  lastName?: string;
  mobilePhoneNumber?: string;
  otherPhoneNumber?: string;
  postalCode?: string;
  state?: string;
  streetAddress?: string;
  websiteURL?: string;
}

function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function buildAddressLine(
  streetAddress?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string
): string | undefined {
  if (!(streetAddress || city || state || postalCode || country)) {
    return;
  }
  const parts = [
    escapeVCardText(streetAddress || ''),
    escapeVCardText(city || ''),
    escapeVCardText(state || ''),
    escapeVCardText(postalCode || ''),
    escapeVCardText(country || ''),
  ];
  return `ADR;TYPE=WORK,PREF:;;${parts.join(';')}`;
}

export const generateVCardString = (data: VCardFormData): string => {
  const {
    firstName,
    lastName,
    mobilePhoneNumber,
    otherPhoneNumber,
    emailAddress,
    companyName,
    jobTitle,
    streetAddress,
    city,
    state,
    postalCode,
    country,
    websiteURL,
  } = data;

  const lines: Array<string | undefined> = [
    'BEGIN:VCARD',
    firstName || lastName
      ? `N:${escapeVCardText(lastName ?? '')};${escapeVCardText(firstName ?? '')}`
      : undefined,
    mobilePhoneNumber
      ? `TEL;TYPE=work,VOICE:${escapeVCardText(mobilePhoneNumber)}`
      : undefined,
    otherPhoneNumber
      ? `TEL;TYPE=home,VOICE:${escapeVCardText(otherPhoneNumber)}`
      : undefined,
    emailAddress ? `EMAIL:${escapeVCardText(emailAddress)}` : undefined,
    companyName ? `ORG:${escapeVCardText(companyName)}` : undefined,
    jobTitle ? `TITLE:${escapeVCardText(jobTitle)}` : undefined,
    buildAddressLine(streetAddress, city, state, postalCode, country),
    websiteURL ? `URL:${escapeVCardText(websiteURL)}` : undefined,
    'VERSION:3.0',
    'END:VCARD',
  ];

  return lines.filter((l): l is string => l !== undefined).join('\n');
};
