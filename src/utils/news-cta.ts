import { isSitePath } from "./site-path";

/**
 * A message's call-to-action button, or null when it has none. The backend only stores site paths;
 * anything else (e.g. from an older or misbehaving backend) shows no button at all.
 */
export function newsCta(item: { ctaLabel?: string; ctaUrl?: string }): { label: string; url: string } | null {
  if (!item.ctaLabel || !isSitePath(item.ctaUrl)) return null;
  return { label: item.ctaLabel, url: item.ctaUrl };
}
