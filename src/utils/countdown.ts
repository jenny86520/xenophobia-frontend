/** Computes a human-readable countdown string toward a given start date/time, or "Starting now" once reached. */
export function formatCountdownToStart(targetDate: string, targetTime: string): string {
  const target = new Date(`${targetDate}T${targetTime}:00`);
  const now = new Date();
  const diff = Math.max(target.getTime() - now.getTime(), 0);

  if (diff === 0) return "Starting now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
