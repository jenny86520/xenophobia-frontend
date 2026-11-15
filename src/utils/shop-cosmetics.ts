import { COSMETIC_KIND_LABELS } from "@/utils/cosmetics";

/**
 * The point shop's cosmetics shelf (spec point-shop): tabs for the admins' zones and for the four
 * kinds, the `?category=` tab and the members' `owned=hide`. Presentation only: an item's kind, its
 * zones and whether the member owns it all come from the backend.
 */

/** The anchor every tab and toggle link jumps to, so the page stays on the cosmetics shelf. */
export const COSMETICS_SHELF_ID = "shelf-cosmetics";

/** The kinds in shelf order; their tab values are the kind codes (zone ids are uuids, never these). */
export const KIND_TABS = ["title", "frame", "stamp", "cup"] as const;

export type ShopCategoryTab = "all" | string;

export type CosmeticGroup<T> = {
  /** A zone id or a kind code. */
  key: string;
  label: string;
  items: T[];
};

type Groupable = { kind: string; categoryIds?: string[] };
type Ownable = { owned: boolean | null };

/**
 * The tabs after 全部: the admins' zones in their order (an item may be in several, of any kind),
 * then the four kinds in shelf order. Tabs without items are left out; each keeps the backend's
 * order of its items.
 */
export function cosmeticTabs<T extends Groupable>(
  categories: ReadonlyArray<{ id: string; name: string }>,
  items: readonly T[],
): CosmeticGroup<T>[] {
  const zones = categories.map((zone) => ({
    key: zone.id,
    label: zone.name,
    items: items.filter((item) => item.categoryIds?.includes(zone.id) ?? false),
  }));
  return [...zones, ...kindSections(items)].filter((group) => group.items.length > 0);
}

/** 全部 in sections by kind (shelf order), each item once; kinds without items are left out. */
export function kindSections<T extends Groupable>(items: readonly T[]): CosmeticGroup<T>[] {
  return KIND_TABS.map((kind) => ({
    key: kind,
    label: COSMETIC_KIND_LABELS[kind],
    items: items.filter((item) => item.kind === kind),
  })).filter((group) => group.items.length > 0);
}

/** The tab named by `?category=`: a group that has items, else 全部. */
export function parseShopCategory(
  value: string | string[] | undefined,
  groups: ReadonlyArray<{ key: string }>,
): ShopCategoryTab {
  return groups.find((group) => group.key === value)?.key ?? "all";
}

/** `owned=hide` counts only for a signed-in member. */
export function parseHideOwned(value: string | string[] | undefined, signedIn: boolean): boolean {
  return signedIn && value === "hide";
}

/**
 * The groups shown under the current tab: that tab's group, or under 全部 every group passed in (the
 * kind sections); with `hideOwned`,
 * collectibles the member owns (`owned === true`) are left out (cups, whose `owned` is null, never
 * are), and groups left empty are dropped.
 */
export function shownGroups<T extends Ownable>(
  groups: readonly CosmeticGroup<T>[],
  current: ShopCategoryTab,
  hideOwned: boolean,
): CosmeticGroup<T>[] {
  return groups
    .filter((group) => current === "all" || group.key === current)
    .map((group) => ({
      ...group,
      items: hideOwned ? group.items.filter((item) => item.owned !== true) : group.items,
    }))
    .filter((group) => group.items.length > 0);
}

/** The URL of a tab with the owned toggle, always landing on the cosmetics shelf. */
export function shopCosmeticsHref(category: ShopCategoryTab, hideOwned: boolean): string {
  const query = new URLSearchParams();
  if (category !== "all") query.set("category", category);
  if (hideOwned) query.set("owned", "hide");
  const search = query.toString();
  return `/shop${search ? `?${search}` : ""}#${COSMETICS_SHELF_ID}`;
}
