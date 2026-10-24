import { ArrowRight } from "lucide-react";
import { ctaPrimaryClasses } from "@/components/brand/cta-link";
import type { SteamIntent } from "@/lib/steam-login";

type SteamLoginLinkProps = {
  intent: SteamIntent;
  label: string;
  variant?: "primary" | "secondary";
};

/**
 * Starts a Steam sign-in (/steam/login, a Route Handler that redirects to Steam). A plain <a>, not
 * next/link: client navigation cannot follow a redirect to another site. Works without JavaScript.
 */
export function SteamLoginLink({ intent, label, variant = "primary" }: SteamLoginLinkProps) {
  const href = `/steam/login?intent=${intent}`;
  if (variant === "secondary") {
    return (
      <a href={href} className="link-underline cta-secondary inline-flex items-center gap-2 text-body text-ink">
        {label}
        <ArrowRight aria-hidden="true" className="cta-arrow size-4" />
      </a>
    );
  }
  return (
    <a href={href} className={ctaPrimaryClasses()}>
      {label}
      <ArrowRight aria-hidden="true" className="cta-arrow size-4" />
    </a>
  );
}
