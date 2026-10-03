/**
 * Fixed "MM/DD HH:mm" for a timeline entry, independent of browser locale and server
 * time zone. The backend stores timeline times as wall-clock values with a Z suffix
 * (a party starting 18:30 has a first entry of "…T18:30:00Z"), so the UTC fields are
 * the intended local time; converting to a zone would shift them.
 */
export function formatTimelineTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}
