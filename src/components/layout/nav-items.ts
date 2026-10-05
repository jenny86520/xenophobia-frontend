/**
 * Primary navigation. Kept outside the "use client" NavLinks module so Server Components can
 * read it. Labels are English on a zh-Hant page, so each carries lang for screen readers.
 */
export const NAV_ITEMS = [
  { href: "/party", label: "Party", lang: "en" },
  { href: "/about", label: "About", lang: "en" },
  { href: "/member", label: "Member", lang: "en" },
] as const;

/** The home link the footer lists before NAV_ITEMS. */
export const HOME_NAV_ITEM = { href: "/", label: "Home", lang: "en" } as const;
