const APP_TIME_ZONE = "Asia/Singapore";

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  timeZone: APP_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: APP_TIME_ZONE,
});

export function formatShortDate(date: string | number | Date) {
  return shortDateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | number | Date) {
  return dateTimeFormatter.format(new Date(date));
}
