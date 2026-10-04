"use client";

import { usePathname } from "next/navigation";
import { TextLink } from "@/components/brand/text-link";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

/** True when `pathname` is `href` or one of its sub-pages (/party/3 is under Party). */
export function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinksProps = {
  className?: string;
  linkClassName?: string;
};

/** Primary navigation links, marking the current section with aria-current="page". */
export function NavLinks({ className, linkClassName }: NavLinksProps) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className={cn("flex", className)}>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <TextLink
            href={item.href}
            lang={item.lang}
            current={isCurrentPath(pathname, item.href)}
            className={linkClassName}
          >
            {item.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
