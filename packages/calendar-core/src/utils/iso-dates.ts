export const GOOGLE_CAL_TEMPLATE_LINK = "https://www.google.com/calendar/render?action=TEMPLATE";

export function trimmedIsoString(date: string): string {
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/T/, "");
}

export function formatLocalDateTimeString(date?: Date | string): string {
  const d = new Date(date ?? new Date());
  const dateStr = d.toISOString().substring(0, 10);
  const timeStr = d
    .toLocaleTimeString("EN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .substring(0, 5);
  return `${dateStr}T${timeStr}`;
}
