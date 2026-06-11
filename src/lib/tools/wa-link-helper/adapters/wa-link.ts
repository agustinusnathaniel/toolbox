import { parsePhoneNumber } from 'awesome-phonenumber';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

import countryCodes from './country-codes.json';

export interface BuildLinkOptions {
  countryCode: string;
  phoneNumber: string;
  text?: string;
}

export interface BuildLinkResult {
  isValid: boolean;
  link: string;
}

export interface CountryOption {
  id: string;
  name: string;
}

export type CountryCode = keyof typeof countryCodes;

export const getPhoneCountryCode = (countryCode: string): string | undefined =>
  countryCodes[countryCode as keyof typeof countryCodes];

export const countryCodeOptions: Array<CountryOption> = Object.keys(
  countryCodes
).map((countryCode) => {
  const countryFlag = getUnicodeFlagIcon(countryCode);
  const regionName =
    new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ?? '';
  const phoneCountryCode = getPhoneCountryCode(countryCode);

  return {
    name: `${countryFlag} ${regionName} - ${phoneCountryCode}`,
    id: countryCode,
  };
});

export const getCountryOptions = (): Array<CountryOption> => countryCodeOptions;

export const buildWhatsAppLink = (
  options: BuildLinkOptions
): BuildLinkResult => {
  const { countryCode, phoneNumber, text } = options;

  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, {
    regionCode: countryCode,
  });

  const isValid = parsedPhoneNumber.valid;

  if (!isValid) {
    return {
      link: '',
      isValid: false,
    };
  }

  const e164Number = parsedPhoneNumber.number?.e164 ?? '';

  if (!e164Number) {
    return {
      link: '',
      isValid: false,
    };
  }

  const encodedText = text?.length ? encodeURIComponent(text) : '';
  const message = encodedText ? `?text=${encodedText}` : '';
  const link = `https://wa.me/${encodeURIComponent(e164Number)}${message}`;

  return {
    link,
    isValid: true,
  };
};
