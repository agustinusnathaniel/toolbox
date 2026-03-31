import { parsePhoneNumber } from "awesome-phonenumber";

export interface BuildLinkOptions {
  countryCode: string;
  phoneNumber: string;
  text?: string;
}

export interface BuildLinkResult {
  link: string;
  isValid: boolean;
}

export const buildWhatsAppLink = (options: BuildLinkOptions): BuildLinkResult => {
  const { countryCode, phoneNumber, text } = options;

  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, {
    regionCode: countryCode,
  });

  const isValid = parsedPhoneNumber.valid;

  if (!isValid) {
    return {
      link: "",
      isValid: false,
    };
  }

  const e164Number = parsedPhoneNumber.number?.e164 ?? "";

  if (!e164Number) {
    return {
      link: "",
      isValid: false,
    };
  }

  const encodedText = text?.length ? encodeURIComponent(text) : "";
  const message = encodedText ? `?text=${encodedText}` : "";
  const link = `https://wa.me/${encodeURIComponent(e164Number)}${message}`;

  return {
    link,
    isValid: true,
  };
};
