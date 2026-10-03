/** Primary navigation. Kept outside the "use client" NavLinks module so Server Components can read it. */
export const NAV_ITEMS = [
  { href: "/party", label: "活動" },
  { href: "/about", label: "關於" },
] as const;
