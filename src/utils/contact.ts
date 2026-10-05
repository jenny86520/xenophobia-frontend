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
