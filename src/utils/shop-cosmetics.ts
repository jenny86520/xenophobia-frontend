/**
 * The point shop's cosmetics shelf (spec point-shop): grouping by the admins' categories, the
 * `?category=` tab and the members' `owned=hide`. Presentation only: which category an item is in
 * and whether the member owns it both come from the backend.
 */

/** The `category` value of the 其他 tab: items without a category (or with one the shop does not list). */
export const OTHER_CATEGORY = "other";
export const OTHER_LABEL = "其他";

/** The anchor every tab and toggle link jumps to, so the page stays on the cosmetics shelf. */
export const COSMETICS_SHELF_ID = "shelf-cosmetics";

export type ShopCategoryTab = "all" | string;

export type CosmeticGroup<T> = {
  /** A category id, or OTHER_CATEGORY. */
  key: string;
  label: string;
  items: T[];
};

type Groupable = { categoryId?: string | null };
type Ownable = { owned: boolean | null };

/**
 * The items grouped by category, in the categories' order with 其他 last; groups without items are
 * left out, and each keeps the backend's order of its items.
 */
export function cosmeticGroups<T extends Groupable>(
  categories: ReadonlyArray<{ id: string; name: string }>,
  items: readonly T[],
): CosmeticGroup<T>[] {
  const known = new Set(categories.map((category) => category.id));
  const keyOf = (item: T) =>
    item.categoryId && known.has(item.categoryId)
      ? item.categoryId
      : OTHER_CATEGORY;
  return [
    ...categories.map((c) => ({ key: c.id, label: c.name })),
    { key: OTHER_CATEGORY, label: OTHER_LABEL },
  ]
    .map((group) => ({
      ...group,
      items: items.filter((item) => keyOf(item) === group.key),
    }))
    .filter((group) => group.items.length > 0);
}

/** The tab named by `?category=`: a group that has items, else 全部. */
export function parseShopCategory(
  value: string | string[] | undefined,
  groups: ReadonlyArray<{ key: string }>,
): ShopCategoryTab {
  return groups.find((group) => group.key === value)?.key ?? "all";
}

/** `owned=hide` counts only for a signed-in member. */
export function parseHideOwned(
  value: string | string[] | undefined,
  signedIn: boolean,
): boolean {
  return signedIn && value === "hide";
}

/**
 * The groups shown under the current tab: one group, or every group under 全部; with `hideOwned`,
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
      items: hideOwned
        ? group.items.filter((item) => item.owned !== true)
        : group.items,
    }))
    .filter((group) => group.items.length > 0);
}

/** The URL of a tab with the owned toggle, always landing on the cosmetics shelf. */
export function shopCosmeticsHref(
  category: ShopCategoryTab,
  hideOwned: boolean,
): string {
  const query = new URLSearchParams();
  if (category !== "all") query.set("category", category);
  if (hideOwned) query.set("owned", "hide");
  const search = query.toString();
  return `/shop${search ? `?${search}` : ""}#${COSMETICS_SHELF_ID}`;
}
