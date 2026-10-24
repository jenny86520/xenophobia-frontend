const TAIPEI_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Fixed "MM/DD HH:mm" in Taiwan time for a sub-party start, independent of browser
 * locale and server time zone. The backend sends Taiwan time with its offset
 * ("…T18:30:00+08:00"); any other offset is converted too.
 */
export function formatSubPartyTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const part = Object.fromEntries(TAIPEI_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return `${part.month}/${part.day} ${part.hour}:${part.minute}`;
}

/** Fixed "YYYY/MM/DD HH:mm" in Taiwan time for a stored timestamp (e.g. when a video was submitted). */
export function formatTaipeiDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const part = Object.fromEntries(TAIPEI_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return `${part.year}/${part.month}/${part.day} ${part.hour}:${part.minute}`;
}
