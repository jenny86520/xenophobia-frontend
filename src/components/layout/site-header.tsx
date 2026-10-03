import Image from "next/image";
import Link from "next/link";
import { BrandName } from "@/components/brand/brand-name";
import { Container } from "@/components/brand/container";
import { CtaLink } from "@/components/brand/cta-link";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

type SiteHeaderProps = {
  brandName: string;
  /** Primary CTA from the team profile; null hides the button. */
  cta: { label: string; href: string } | null;
};

/** Brand, primary navigation and CTA (design §1). Below 1024px nav and CTA move into MobileMenu. */
export function SiteHeader({ brandName, cta }: SiteHeaderProps) {
  return (
    <header className="border-b border-line-subtle">
      <Container className="flex min-h-16 items-center justify-between gap-6 py-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Image src="/brand/xpa-logo.png" alt="" width={32} height={32} priority />
          <span className="font-mono text-label tracking-[0.12em] text-ink uppercase">
            <BrandName name={brandName} />
          </span>
        </Link>
        <div className="hidden items-center gap-10 lg:flex">
          <nav aria-label="主要導覽">
            <NavLinks className="gap-8" linkClassName="text-body text-ink-secondary hover:text-ink aria-[current=page]:text-ink" />
          </nav>
          {cta && <CtaLink href={cta.href} label={cta.label} />}
        </div>
        <MobileMenu cta={cta} />
      </Container>
    </header>
  );
}
