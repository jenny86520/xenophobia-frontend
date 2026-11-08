import type { ContactInfo } from "@/types/about";

/**
 * Link target for a contact entry, or null when it should render as plain text
 * (type "other", or a website value that is not an http(s) URL).
 */
export function contactHref(contact: ContactInfo): string | null {
  const value = contact.value.trim();
  switch (contact.type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value.replace(/[^\d+]/g, "")}`;
    case "website":
      return /^https?:\/\//i.test(value) ? value : null;
    default:
      return null;
  }
}

/**
 * A contact value cut right after each `@` and `.`, the only places it should wrap
 * (`xpagchannel@` / `gmail.com`, never `xpagchannel@gmail.co` / `m`). Joining the parts
 * gives the value back unchanged.
 */
export function splitAfterSeparators(value: string): string[] {
  return value.split(/(?<=[@.])/).filter(Boolean);
}
