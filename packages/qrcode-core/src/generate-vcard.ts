import type { VCardFormData } from "./types";

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

  const lines: Array<string> = [
    "BEGIN:VCARD",
    `${firstName || lastName ? "N:" : ""}${lastName}${lastName ? ";" : ""}${firstName}`,
    mobilePhoneNumber ? `TEL;TYPE=work,VOICE:${mobilePhoneNumber}` : "",
    otherPhoneNumber ? `TEL;TYPE=home,VOICE:${otherPhoneNumber}` : "",
    emailAddress ? `EMAIL:${emailAddress}` : "",
    companyName ? `ORG:${companyName}` : "",
    jobTitle ? `TITLE:${jobTitle}` : "",
    streetAddress || city || state || postalCode || country
      ? `ADR;TYPE=WORK,PREF:;;${streetAddress || ""}${streetAddress ? ";" : ""}${city || ""}${city ? ";" : ""}${state || ""}${state ? ";" : ""}${postalCode || ""}${postalCode ? ";" : ""}${country || ""}`
      : "",
    websiteURL ? `URL:${websiteURL}` : "",
    "VERSION:3.0",
    "END:VCARD",
  ];

  return lines.filter(Boolean).join("\n");
};
