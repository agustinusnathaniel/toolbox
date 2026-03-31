import getUnicodeFlagIcon from "country-flag-icons/unicode";

import countryCodes from "./country-codes.json";

export interface CountryOption {
  label: string;
  value: string;
}

export type CountryCode = keyof typeof countryCodes;

export const getPhoneCountryCode = (
  countryCode: string,
): string | undefined => {
  return countryCodes[countryCode as keyof typeof countryCodes];
};

export const countryCodeOptions: CountryOption[] = Object.keys(countryCodes)
  .map((countryCode) => {
    const countryFlag = getUnicodeFlagIcon(countryCode);
    const regionName = new Intl.DisplayNames(["en"], { type: "region" }).of(
      countryCode,
    );
    const phoneCountryCode = getPhoneCountryCode(countryCode);

    return {
      label: `${countryFlag} ${regionName} - ${phoneCountryCode}`,
      value: countryCode,
    };
  });

export const getCountryOptions = (): CountryOption[] => countryCodeOptions;
