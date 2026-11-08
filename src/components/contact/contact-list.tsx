import { Globe, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import type { ContactInfo } from "@/types/about";
import { contactHref } from "@/utils/contact";
import { BreakableValue } from "./breakable-value";

/** Decorative icon per contact type (unknown types get the "other" one); the label still names the entry. */
const CONTACT_ICONS: Record<string, LucideIcon> = {
  email: Mail,
  website: Globe,
  phone: Phone,
  other: MessageCircle,
};

/**
 * Contact entries as hairline-ruled label/value rows, in the order given (the backend's
 * display order). Values that can be linked (email, phone, http(s) website)
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
              <MetaLabel className="inline-flex items-center gap-1.5">
                <ContactIcon type={item.type} />
                {item.label}
              </MetaLabel>
            </dt>
            <dd className="text-lead text-ink [overflow-wrap:anywhere]">
              {href ? (
                <TextLink href={href}>
                  <BreakableValue value={item.value} />
                </TextLink>
              ) : (
                <BreakableValue value={item.value} />
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ContactIcon({ type }: { type: ContactInfo["type"] }) {
  const Icon = CONTACT_ICONS[type] ?? MessageCircle;
  return <Icon aria-hidden="true" data-contact-type={type} className="size-3.5 shrink-0" />;
}
