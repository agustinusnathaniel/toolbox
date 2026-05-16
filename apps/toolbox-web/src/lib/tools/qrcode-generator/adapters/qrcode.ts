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
  return `ADR;TYPE=WORK,PREF:;;${streetAddress || ''}${streetAddress ? ';' : ''}${city || ''}${city ? ';' : ''}${state || ''}${state ? ';' : ''}${postalCode || ''}${postalCode ? ';' : ''}${country || ''}`;
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
      ? `N:${lastName || ''}${lastName ? ';' : ''}${firstName || ''}`
      : undefined,
    mobilePhoneNumber ? `TEL;TYPE=work,VOICE:${mobilePhoneNumber}` : undefined,
    otherPhoneNumber ? `TEL;TYPE=home,VOICE:${otherPhoneNumber}` : undefined,
    emailAddress ? `EMAIL:${emailAddress}` : undefined,
    companyName ? `ORG:${companyName}` : undefined,
    jobTitle ? `TITLE:${jobTitle}` : undefined,
    buildAddressLine(streetAddress, city, state, postalCode, country),
    websiteURL ? `URL:${websiteURL}` : undefined,
    'VERSION:3.0',
    'END:VCARD',
  ];

  return lines.filter((l): l is string => l !== undefined).join('\n');
};
