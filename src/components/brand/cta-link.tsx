import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isExternalHref, TextLink } from "./text-link";

type CtaLinkProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  size?: "default" | "large";
  className?: string;
};

/**
 * Call to action. Primary: solid CTA-red block with an arrow that nudges on hover.
 * Secondary: a text link with an arrow. Both handle internal and external targets.
 */
export function CtaLink({ href, label, variant = "primary", size = "default", className }: CtaLinkProps) {
  if (variant === "secondary") {
    return (
      <TextLink href={href} className={cn("cta-secondary inline-flex items-center gap-2 text-ink", className)}>
        {label}
        {!isExternalHref(href) && <ArrowRight aria-hidden="true" className="cta-arrow size-4" />}
      </TextLink>
    );
  }

  const classes = cn(
    "cta-primary group inline-flex items-center gap-3 rounded-sm bg-cta font-medium text-cta-ink",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
    size === "large" ? "px-7 py-4 text-lead" : "px-5 py-3 text-body",
    className,
  );
  const content = (
    <>
      {label}
      <ArrowRight aria-hidden="true" className="cta-arrow size-4" />
    </>
  );

  if (isExternalHref(href)) {
    const opensTab = /^https?:/i.test(href);
    return (
      <a href={href} className={classes} {...(opensTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
        {opensTab && <span className="sr-only">（另開新視窗）</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
