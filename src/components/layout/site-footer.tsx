import { BrandName } from "@/components/brand/brand-name";
import { Container } from "@/components/brand/container";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { MetaLabel } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import { TextLink } from "@/components/brand/text-link";
import type { AboutContent, ContactInfo } from "@/types/about";
import { contactHref } from "@/utils/contact";
import { HOME_NAV_ITEM, NAV_ITEMS } from "./nav-items";

type SiteFooterProps = {
  brandName: string;
  /** null when the about content could not be loaded; data columns are then omitted. */
  about: AboutContent | null;
  version: string;
};

function ContactLine({ contact }: { contact: ContactInfo }) {
  const href = contactHref(contact);
  return (
    <li className="flex flex-col">
      <MetaLabel>{contact.label}</MetaLabel>
      {href ? (
        <TextLink href={href} className="break-all text-ink-secondary hover:text-ink">
          {contact.value}
        </TextLink>
      ) : (
        <span className="break-all text-ink-secondary">{contact.value}</span>
      )}
    </li>
  );
}

function Column({ title, id, className, children }: { title: string; id: string; className: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id}>
        <MetaLabel>{title}</MetaLabel>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Official footer IA (design §1): brand, nav, contact, social, legal, build. */
export function SiteFooter({ brandName, about, version }: SiteFooterProps) {
  const contacts = about?.contactInfo.filter((c) => c.type !== "social") ?? [];
  const socials = about?.contactInfo.filter((c) => c.type === "social") ?? [];
  const tagline = about?.teamProfile.tagline ?? "";

  return (
    <footer className="mt-auto border-t border-line">
      {/* pb-24 keeps the last row clear of the floating BackToTop button. */}
      <Container className="pt-section-tight pb-24">
        <EditorialGrid className="gap-y-10">
          <div className="col-span-4 flex flex-col gap-3 md:col-span-8 lg:col-span-4">
            <p className="font-mono text-label tracking-[0.12em] text-ink uppercase">
              <BrandName name={brandName} />
            </p>
            {about &&
              (tagline ? (
                <p className="text-body text-ink-secondary">{tagline}</p>
              ) : (
                <Placeholder name="brand.tagline" label="品牌標語" inline className="self-start" />
              ))}
          </div>

          <Column title="Index" id="footer-nav" className="col-span-2 md:col-span-2 lg:col-start-6">
            <nav aria-labelledby="footer-nav">
              <ul className="flex flex-col gap-2">
                {[HOME_NAV_ITEM, ...NAV_ITEMS].map((item) => (
                  <li key={item.href}>
                    <TextLink href={item.href} lang={item.lang} className="text-ink-secondary hover:text-ink">
                      {item.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </nav>
          </Column>

          {about && (
            <>
              <Column title="Contact" id="footer-contact" className="col-span-4 md:col-span-3 lg:col-span-2">
                {contacts.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {contacts.map((c) => <ContactLine key={c.id} contact={c} />)}
                  </ul>
                ) : (
                  <Placeholder name="contact.any" label="聯絡資訊" />
                )}
              </Column>

              <Column title="Social" id="footer-social" className="col-span-4 md:col-span-3 lg:col-span-2">
                {socials.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {socials.map((c) => <ContactLine key={c.id} contact={c} />)}
                  </ul>
                ) : (
                  <Placeholder name="contact.social" label="社群連結" />
                )}
              </Column>
            </>
          )}
        </EditorialGrid>

        <div className="mt-section-tight flex flex-col gap-4 border-t border-line-subtle pt-6 md:flex-row md:items-center md:justify-between">
          <MetaLabel>
            © {new Date().getFullYear()} {brandName}
          </MetaLabel>
          <div className="flex flex-wrap items-center gap-3">
            <Placeholder name="legal.privacy" label="隱私權政策" inline />
            <Placeholder name="legal.terms" label="使用條款" inline />
          </div>
          <MetaLabel>Build {version}</MetaLabel>
        </div>
      </Container>
    </footer>
  );
}
