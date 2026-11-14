"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { CSSProperties, MouseEvent } from "react";
import { PendingCount } from "@/components/brand/pending-count";
import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavCount, type NavGroup, type NavLink } from "./nav-items";

/** True when `pathname` is `href` or one of its sub-pages (/party/3 is under Party). */
export function isCurrentPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinksProps = {
  className?: string;
  linkClassName?: string;
  /**
   * Ice creams waiting for the signed-in member, beside Member. Friend requests and scrim invites are
   * counted on the friends sidebar's handle instead.
   */
  memberIceCreams?: number;
  /** Messages the signed-in member has not read yet, beside News and its group. */
  newsUnread?: number;
  /**
   * How a group shows: "popover" (the header: one button opening its links) or "heading" (the
   * full-screen menu, where there is room: a heading over the links, nothing to open).
   */
  groups?: "popover" | "heading";
};

/** Primary navigation links, marking the current section with aria-current="page". */
export function NavLinks({
  className,
  linkClassName,
  memberIceCreams = 0,
  newsUnread = 0,
  groups = "popover",
}: NavLinksProps) {
  const pathname = usePathname() ?? "/";
  const counts: Record<NavCount, number> = { iceCreams: memberIceCreams, news: newsUnread };
  const link = (item: NavLink) => (
    <TextLink
      href={item.href}
      lang={item.lang}
      icon={item.icon}
      current={isCurrentPath(pathname, item.href)}
      className={linkClassName}
      after={item.count ? <NavCountBadge kind={item.count} count={counts[item.count]} /> : undefined}
    >
      {item.label}
    </TextLink>
  );
  return (
    <ul className={cn("flex", className)}>
      {NAV_ITEMS.map((item) =>
        item.kind === "link" ? (
          <li key={item.href}>{link(item)}</li>
        ) : groups === "heading" ? (
          <li key={item.id}>
            <MetaLabel className="inline-flex items-center gap-2">
              <item.icon aria-hidden="true" className="size-[0.9em] shrink-0" />
              <span lang={item.lang}>{item.label}</span>
            </MetaLabel>
            <ul className="mt-4 flex flex-col gap-4 border-l border-line pl-5">
              {item.items.map((child) => (
                <li key={child.href}>{link(child)}</li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={item.id}>
            <NavGroupMenu
              group={item}
              pathname={pathname}
              count={item.items.reduce((sum, child) => sum + (child.count ? counts[child.count] : 0), 0)}
              className={linkClassName}
              renderLink={link}
            />
          </li>
        ),
      )}
    </ul>
  );
}

function NavCountBadge({ kind, count }: { kind: NavCount; count: number }) {
  return <PendingCount count={count} unit={kind === "news" ? "則未讀" : "件待處理"} />;
}

type NavGroupMenuProps = {
  group: NavGroup;
  pathname: string;
  count: number;
  className?: string;
  renderLink: (item: NavLink) => React.ReactNode;
};

/**
 * A group in the header: a button opening its links in a native popover, so it opens without
 * JavaScript, closes on Esc or a click outside, and lives in the top layer (the home header's
 * clip-path reveal cannot cut it off). Placed under the button with CSS anchor positioning
 * (.nav-group-menu in globals.css, with a fixed fallback). It opens only on a click, never on hover.
 */
function NavGroupMenu({ group, pathname, count, className, renderLink }: NavGroupMenuProps) {
  const current = group.items.some((item) => isCurrentPath(pathname, item.href));
  const menuId = `${group.id}-menu`;
  // Choosing a link navigates without a reload, so the popover is closed by hand.
  const closeOnLink = (event: MouseEvent<HTMLUListElement>) => {
    if ((event.target as HTMLElement).closest("a")) event.currentTarget.hidePopover?.();
  };
  return (
    <>
      <button
        type="button"
        popoverTarget={menuId}
        data-current={current || undefined}
        style={{ anchorName: `--${group.id}` } as CSSProperties}
        className={cn(
          "nav-group-trigger link-with-icon inline-flex cursor-pointer items-center gap-2 data-current:text-ink",
          className,
        )}
      >
        <group.icon aria-hidden="true" className="size-[0.9em] shrink-0" />
        <span className="link-underline" lang={group.lang}>
          {group.label}
        </span>
        <ChevronDown aria-hidden="true" className="nav-group-chevron size-[0.9em] shrink-0" />
        <PendingCount count={count} unit="則未讀" />
      </button>
      <ul
        id={menuId}
        popover="auto"
        style={{ positionAnchor: `--${group.id}` } as CSSProperties}
        className="nav-group-menu"
        onClick={closeOnLink}
      >
        {group.items.map((item) => (
          <li key={item.href}>{renderLink(item)}</li>
        ))}
      </ul>
    </>
  );
}
