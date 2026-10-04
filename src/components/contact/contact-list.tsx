import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import type { ContactInfo } from "@/types/about";
import { contactHref } from "@/utils/contact";

/**
 * Contact entries as hairline-ruled label/value rows, in the order given (the backend's
 * display order). Values that can be linked (email, phone, http(s) website/social)
 * become TextLinks; others stay plain text. Callers handle the empty case.
 */
export function ContactList({ contacts }: { contacts: ContactInfo[] }) {
  return (
    <dl className="border-b border-line">
      {contacts.map((item) => {
        const href = contactHref(item);
        return (
          <div key={item.id} className="grid grid-cols-1 gap-1 border-t border-line py-5 md:grid-cols-[12rem_1fr] md:gap-6">
            <dt>
              <MetaLabel>{item.label}</MetaLabel>
            </dt>
            <dd className="text-lead break-all text-ink">
              {href ? <TextLink href={href}>{item.value}</TextLink> : item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
