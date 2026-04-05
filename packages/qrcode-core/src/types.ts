export const QRStyleOptions = ["dots", "squares"] as const;

export type QRStyle = (typeof QRStyleOptions)[number];

export interface VCardFormData {
  firstName?: string;
  lastName?: string;
  mobilePhoneNumber?: string;
  otherPhoneNumber?: string;
  emailAddress?: string;
  companyName?: string;
  jobTitle?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  websiteURL?: string;
}

export interface QRCodeOptions {
  value: string;
  fgColor?: string;
  qrStyle?: QRStyle;
}
