import getUnicodeFlagIcon from "country-flag-icons/unicode";

import countryCodes from "./country-codes.json";

export interface CountryOption {
	name: string;
	id: string;
}

export type CountryCode = keyof typeof countryCodes;

export const getPhoneCountryCode = (
	countryCode: string,
): string | undefined => {
	return countryCodes[countryCode as keyof typeof countryCodes];
};

export const countryCodeOptions: CountryOption[] = Object.keys(
	countryCodes,
).map((countryCode) => {
	const countryFlag = getUnicodeFlagIcon(countryCode);
	const regionName =
		new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? "";
	const phoneCountryCode = getPhoneCountryCode(countryCode);

	return {
		name: `${countryFlag} ${regionName} - ${phoneCountryCode}`,
		id: countryCode,
	};
});

export const getCountryOptions = (): CountryOption[] => countryCodeOptions;
