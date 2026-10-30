import { Info, PartyPopper, UserRound } from "lucide-react";

/**
 * Primary navigation. Kept outside the "use client" NavLinks module so Server Components can
 * read it. Labels are English on a zh-Hant page, so each carries lang for screen readers. The
 * icon is decorative (header and mobile menu); the label stays the link's name.
 */
export const NAV_ITEMS = [
  { href: "/party", label: "Party", lang: "en", icon: PartyPopper },
  { href: "/about", label: "About", lang: "en", icon: Info },
  { href: "/member", label: "Member", lang: "en", icon: UserRound },
] as const;

/** The home link the footer lists before NAV_ITEMS. */
export const HOME_NAV_ITEM = { href: "/", label: "Home", lang: "en" } as const;
