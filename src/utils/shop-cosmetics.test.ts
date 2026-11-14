import {
  cosmeticGroups,
  OTHER_CATEGORY,
  parseHideOwned,
  parseShopCategory,
  shopCosmeticsHref,
  shownGroups,
} from "./shop-cosmetics";

const categories = [
  { id: "xmas", name: "聖誕系列" },
  { id: "party", name: "派對限定" },
  { id: "spring", name: "新春" },
];

const item = (
  id: string,
  categoryId: string | null,
  owned: boolean | null = false,
) => ({ id, categoryId, owned });

const items = [
  item("t1", "party"),
  item("t2", "xmas", true),
  item("loose", null),
  item("cup", "xmas", null),
  item("gone", "deleted-category"),
];

describe("cosmeticGroups", () => {
  it("follows the categories' order, puts 其他 last and leaves out empty groups", () => {
    const groups = cosmeticGroups(categories, items);
    expect(
      groups.map((g) => [g.key, g.label, g.items.map((i) => i.id)]),
    ).toEqual([
      ["xmas", "聖誕系列", ["t2", "cup"]],
      ["party", "派對限定", ["t1"]],
      [OTHER_CATEGORY, "其他", ["loose", "gone"]],
    ]);
  });

  it("puts everything under 其他 when there are no categories", () => {
    expect(
      cosmeticGroups([], items).map((g) => [g.key, g.items.length]),
    ).toEqual([[OTHER_CATEGORY, 5]]);
  });

  it("has no groups without items", () => {
    expect(cosmeticGroups(categories, [])).toEqual([]);
  });
});

describe("parseShopCategory", () => {
  const groups = cosmeticGroups(categories, items);

  it("accepts a category that has items, and 其他", () => {
    expect(parseShopCategory("party", groups)).toBe("party");
    expect(parseShopCategory("other", groups)).toBe(OTHER_CATEGORY);
  });

  it("falls back to 全部 for anything missing, unknown or empty", () => {
    expect(parseShopCategory(undefined, groups)).toBe("all");
    expect(parseShopCategory("abc", groups)).toBe("all");
    expect(parseShopCategory("spring", groups)).toBe("all");
    expect(parseShopCategory(["party"], groups)).toBe("all");
  });
});

describe("parseHideOwned", () => {
  it("hides owned items only for a signed-in member asking for it", () => {
    expect(parseHideOwned("hide", true)).toBe(true);
    expect(parseHideOwned("hide", false)).toBe(false);
    expect(parseHideOwned(undefined, true)).toBe(false);
    expect(parseHideOwned("yes", true)).toBe(false);
  });
});

describe("shownGroups", () => {
  const groups = cosmeticGroups(categories, items);

  it("shows every group under 全部 and one group under its tab", () => {
    expect(shownGroups(groups, "all", false).map((g) => g.key)).toEqual([
      "xmas",
      "party",
      OTHER_CATEGORY,
    ]);
    expect(shownGroups(groups, "party", false).map((g) => g.key)).toEqual([
      "party",
    ]);
  });

  it("hides owned collectibles but never cups, dropping groups left empty", () => {
    const shown = shownGroups(groups, "xmas", true);
    expect(shown.map((g) => g.items.map((i) => i.id))).toEqual([["cup"]]);
    const onlyOwned = cosmeticGroups(categories, [item("t2", "xmas", true)]);
    expect(shownGroups(onlyOwned, "xmas", true)).toEqual([]);
  });

  it("does not change the groups' own counts", () => {
    shownGroups(groups, "all", true);
    expect(groups[0].items).toHaveLength(2);
  });
});

describe("shopCosmeticsHref", () => {
  it("keeps the tab and the toggle and lands on the shelf", () => {
    expect(shopCosmeticsHref("all", false)).toBe("/shop#shelf-cosmetics");
    expect(shopCosmeticsHref("party", false)).toBe(
      "/shop?category=party#shelf-cosmetics",
    );
    expect(shopCosmeticsHref("party", true)).toBe(
      "/shop?category=party&owned=hide#shelf-cosmetics",
    );
    expect(shopCosmeticsHref("all", true)).toBe(
      "/shop?owned=hide#shelf-cosmetics",
    );
  });
});
