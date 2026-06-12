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

export const DEFAULT_URL_STATE: UrlState = {
  value: 'https://google.com',
  fgColor: '#000000',
  bgColor: '#ffffff',
};

export const DEFAULT_VCARD_STATE: VCardState = {
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

export type SearchParams = {
  bg?: string;
  cn?: string;
  co?: string;
  ct?: string;
  em?: string;
  fg?: string;
  fn?: string;
  jt?: string;
  ln?: string;
  mode?: 'url' | 'vcard';
  mp?: string;
  op?: string;
  pc?: string;
  sa?: string;
  st?: string;
  value?: string;
  wb?: string;
};

export function formatHex(color?: string): string | undefined {
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

export function buildUrlParams(state: UrlState): URLSearchParams {
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

export function buildVCardParams(state: VCardState): URLSearchParams {
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

export function buildVcardStateFromSearch(search: SearchParams): VCardState {
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

export function buildUrlStateFromSearch(search: SearchParams): UrlState {
  return {
    value: search.value ?? DEFAULT_URL_STATE.value,
    fgColor: formatHex(search.fg) ?? DEFAULT_URL_STATE.fgColor,
    bgColor: formatHex(search.bg) ?? DEFAULT_URL_STATE.bgColor,
  };
}
