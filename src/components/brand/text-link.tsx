import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** True for links that leave the site (http(s), mailto and tel). Only http(s) opens a new tab. */
export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Marks the current page in navigation. */
  current?: boolean;
};

/**
 * Inline link with the animated underline (design §7). External links open in a
 * new tab, get rel="noopener noreferrer" and an announced "opens in a new window" hint.
 */
export function TextLink({ href, children, className, current }: TextLinkProps) {
  const classes = cn("link-underline", className);
  if (isExternalHref(href)) {
    const opensTab = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(opensTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {opensTab && (
          <>
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only">（另開新視窗）</span>
          </>
        )}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
