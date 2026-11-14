import {
  BookOpen,
  Clapperboard,
  Crown,
  Info,
  Newspaper,
  PartyPopper,
  Store,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/** Which waiting count a link shows: Member's ice creams waiting, or News's unread messages. */
export type NavCount = "iceCreams" | "news";

export type NavLink = {
  kind: "link";
  href: string;
  label: string;
  lang: "en";
  icon: LucideIcon;
  count?: NavCount;
};

/** Pages that are looked up now and then, behind one button (a popover) instead of side by side. */
export type NavGroup = {
  kind: "group";
  id: string;
  label: string;
  lang: "en";
  icon: LucideIcon;
  items: readonly NavLink[];
};

/**
 * Primary navigation. Kept outside the "use client" NavLinks module so Server Components can
 * read it. Labels are English on a zh-Hant page, so each carries lang for screen readers. The
 * icon is decorative (header and mobile menu); the label stays the link's name. Everyday pages stay
 * side by side; the "Info" group holds the ones about the site.
 */
export const NAV_ITEMS: readonly (NavLink | NavGroup)[] = [
  { kind: "link", href: "/party", label: "Party", lang: "en", icon: PartyPopper },
  { kind: "link", href: "/legends", label: "Legends", lang: "en", icon: Crown },
  { kind: "link", href: "/shop", label: "Shop", lang: "en", icon: Store },
  { kind: "link", href: "/clips", label: "Clips", lang: "en", icon: Clapperboard },
  {
    kind: "group",
    id: "nav-info",
    label: "Info",
    lang: "en",
    icon: Info,
    items: [
      { kind: "link", href: "/about", label: "About", lang: "en", icon: UsersRound },
      { kind: "link", href: "/news", label: "News", lang: "en", icon: Newspaper, count: "news" },
      { kind: "link", href: "/guide", label: "Guide", lang: "en", icon: BookOpen },
    ],
  },
  { kind: "link", href: "/member", label: "Member", lang: "en", icon: UserRound, count: "iceCreams" },
];

/** The home link the footer lists before the others. */
export const HOME_NAV_ITEM = { href: "/", label: "Home", lang: "en" } as const;

/** Every link in order with the groups opened up (the footer lists them flat). */
export function flatNavLinks(): NavLink[] {
  return NAV_ITEMS.flatMap((item) => (item.kind === "group" ? [...item.items] : [item]));
}
