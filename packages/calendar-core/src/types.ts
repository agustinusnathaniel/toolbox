export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
}

export type CalendarProvider = "google";

export interface CalendarLinkResult {
  url: string;
  provider: CalendarProvider;
}

export interface CalendarProviderConfig {
  name: string;
  generateLink: (event: CalendarEvent) => string;
}
